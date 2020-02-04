const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
exports.sendNotification = functions.firestore
  .document('messages/{groupId1}/{groupId2}/{message}')
  .onCreate((snap, context) => {
    console.log('----------------start function--------------------')
    const doc = snap.data()
    console.log(doc)
    const idFrom = doc.idFrom
    const idTo = doc.idTo
    const contentMessage = doc.content
    const nameFrom = doc.nameFrom
    const threadId = doc.threadId
    // const data = doc.data
    // Get push token user to (receive)
    const payload = {
      notification: {
        title: `You have a message from "${nameFrom}"`,
        body: contentMessage,
        badge: '1',
        sound: 'default'
      },
      data :{
        threadId: threadId,
        threadname: doc.nameFrom,
        photoFrom: doc.photoFrom,
        idTo: doc.idTo
      }
    }
    if(idTo != '') {
      admin
      .firestore()
      .collection('users')
      .where('id', '==', idTo)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(userTo => {
          if (userTo.data().pushToken && userTo.data().chattingWith !== idFrom) {
            // Get info user from (sent)
                  admin
                    .messaging()
                    .sendToDevice(userTo.data().pushToken, payload)
                    .then(response => {
                      console.log('Successfully sent message:', response)
                    })
                    .catch(error => {
                      console.log('Error sending message:', error)
                    })
                    
          } else {
            console.log('Can not find pushToken target user')
          }
        })
      })
    } else {
      admin
        .messaging()
        .sendToTopic(threadId, payload)
        .then(response => {
          console.log('Successfully sent message:', response)
        })
        .catch(error => {
          console.log('Error sending group message:', error)
        })
    }
    return null
  })