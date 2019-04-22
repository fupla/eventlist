import { AlertController, ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class EventRegistrationService {

  constructor(public alertController: AlertController, public toast: ToastController) { }

  // Event Register Function
  eventReg(event, userID) {
    event.guests.forEach(data => {
      if (data === userID) {
        console.log('du bist schon eingeloggt');
        return;
      }
    });
    if (event.guests.length + event.already >= event.max) {
      this.alertFunction();
      return;
    }
    if (event.guests.length + event.already < event.max) {
      firebase.firestore().collection('events').doc(event.uid).update({
        guests: firebase.firestore.FieldValue.arrayUnion(userID)
      }).then(() => {
        this.toastFunction('Du bist für dieses Event registriert');
      }).catch(err => console.log(err));
      return;
    }
  }

  // Event UnRegister
  eventDeleteReg(event, userID) {
    event.guests.forEach(data => {
      if (data === userID) {
        firebase.firestore().collection('events').doc(event.uid).update({
          guests: firebase.firestore.FieldValue.arrayRemove(userID)
        }).then(() => {
          this.toastFunction('Du bist nicht mehr für dieses Event registriert');
        }).catch(err => console.log(err));
      }
    });
  }

  // Alert Function
  async alertFunction() {
    const alert = await this.alertController.create({
      header: 'Achtung',
      subHeader: 'Event ausgebucht',
      message: 'Dieses Event ist leider ausgebucht',
      buttons: ['OK']
    });

    await alert.present();
  }

  // Toastcontroller
  async toastFunction(message) {
    const toast = await this.toast.create({
      message: message,
      duration: 4000
    });
    toast.present();
  }

  // Check if User is already registrated
  checkReg(userID, event) {
    console.log('haha');
  }

}
