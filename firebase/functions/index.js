const {onRequest} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const firestore = admin.firestore();

const p = require('./p.json');
const restoreCodeEmail = require('./restoreCodeEmail');

getUserByUID = uid =>
  new Promise(async (resolve, reject) => {
    // Returns a ref to the user document. Data obj can be accessed with .data();
    try {
      let user = null;
      const usersCollection = firestore.collection('users');
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

getUserByEmail = email =>
  new Promise(async (resolve, reject) => {
    // Returns a ref to the user document. Data obj can be accessed with .data();
    try {
      let user = null;
      const usersCollection = firestore.collection('users');
      const query = usersCollection.where('email', '==', email).limit(1);
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
    return res
      .status(400)
      .json({success: false, message: 'Missing request body'});
  }
  // Returns a ref to the user document. Data obj can be accessed with .data();
  let user = null;
  try {
    user = await getUserByUID(uid);
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

exports.sendRestoreCode = onRequest(async (req, res) => {
  const {email} = req.body;
  if (!email) {
    return res.status(400).json({success: false, message: 'Missing UID'});
  }
  // Create a random 5 character code
  const code = [...Array(5)]
    .map(() => Math.random().toString(36)[2])
    .join('')
    .toUpperCase();

  // Get the user reference
  let user = null;
  try {
    user = await getUserByEmail(email);
  } catch (err) {
    return res
      .status(404)
      .json({success: false, message: 'Could not find user'});
  }

  // Check if the user has purchased the product
  if (!user.data().purchasedNoAds) {
    await user.ref.update({codeValid: false});
    return res
      .status(403)
      .json({success: false, message: 'User has not purchased'});
  }

  // Save the new code to the user
  try {
    await user.ref.update({code, codeValid: true});
  } catch (err) {
    return res.status(500).json({success: false, message: 'Server Error'});
  }

  // Create email paramters for MailGun
  const credentials = btoa(`api:${p.keys.mg_api}`);
  const mg_config = {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  const content = {
    from: `Just Dogs <JustDogs@${p.urls.mg_base}>`,
    to: user.data().email,
    subject: 'Just Dogs Recovery Code',
    text: `Thank you for your support! Your Purchase Recovery Code is: ${code}`,
    html: restoreCodeEmail(code),
  };

  // Email the user the new code
  try {
    await axios.post(`${p.urls.mg}/messages`, content, mg_config);
    return res.status(200).json({success: true, message: 'Email Sent'});
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({success: false, message: 'Error sending email'});
  }
});
