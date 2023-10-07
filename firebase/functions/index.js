const {onRequest} = require('firebase-functions/v2/https');
//const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
const firestore = admin.firestore()

exports.updateUserEmail = onRequest(async (req, res) => {
  const {email, uid} = req.body;
  if (!email || !uid) {
    return res.status(400).json({
      success: false,
      message: 'Missing email or UID in the request body',
    });
  }
  // Returns a ref to the user document. Data obj can be accessed with .data();
  try {
    let user = null;
    const usersCollection = firestore.collection('users');
    const query = usersCollection.where('uid', '==', uid).limit(1);
    const snapshot = await query.get();
    if (!snapshot.empty) {
      user = snapshot.docs[0];
    } else {
      res.status(404).json({success: false, message: 'User does not exist'});
    }
    await user.ref.update({email});
    res.status(200).json({success: true, message: 'Email added'});
  } catch (err) {
    res.status(500).json({success: false, message: 'Server Error'});
  }
});
