const {onRequest} = require('firebase-functions/v2/https');

const admin = require('firebase-admin');
const firestore = admin.firestore();

admin.initializeApp();


getUserRef = (uid) => new Promise(async (resolve, reject) => {
    // Returns a ref to the user document. Data obj can be accessed with .data();
    try {
      let user = null;
      const usersCollection = firestore().collection('users');
      const query = usersCollection.where('uid', '==', uid).limit(1);
      const snapshot = await query.get();
      if (!snapshot.empty) {
        user = snapshot.docs[0];
      } else {
        throw new Error('User not found');
      }
      return resolve(user);
    } catch (err) {
      return reject(err);
    }
  });


exports.updateUserEmail = onRequest(async (req, res) => {
  const {email, uid} = req.body;
  if (!email || !uid) {
    return res.status(400).json({success: false, message: 'Missing request body',});
  }
  // Returns a ref to the user document. Data obj can be accessed with .data();
  let user = null;
  try {
      user = await getUserRef(uid);
  } catch (err) {
      res.status(404).json({success: false, message: 'Could not find user'});
  }
  try {
    await user.ref.update({email});
    res.status(200).json({success: true, message: 'Email added'});
  } catch (err) {
    res.status(500).json({success: false, message: 'Server Error'});
  }
});
