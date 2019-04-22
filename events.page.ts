import { AuthService } from './../../services/auth.service';
import { EventRegistrationService } from './../../services/event-registration.service';
import { LoadingController, ActionSheetController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {

  public events: any[];
  public loading: HTMLIonLoadingElement;
  public userID: any;

  constructor(
    private firestore: AngularFirestore,
    public loadingController: LoadingController,
    private actionController: ActionSheetController,
    private register: EventRegistrationService,
    private authService: AuthService,
    private alertController: AlertController
    ) { }

  ngOnInit() {
    this.getUser();
    this.getEvents();
  }

  // Get ALL Events
  getEvents() {
    this.firestore.collection('events')
    .valueChanges().subscribe(eventList => {
      this.events = eventList;
      this.events.sort(( a, b) => {
        const keyA = a.datetime;
        const keyB = b.datetime;
        if (keyA < keyB) {
          return -1;
        }
        if (keyA > keyB) {
          return 1;
        }
          return 0;
      });
      this.events.forEach(data => {
        const newData = data;
        this.checkState(data);
        this.checkFull(data);
        data.guests.forEach(guest => {
          if (this.userID === guest) {
            newData.isReg = true;
          } if (this.userID !== guest) {
            newData.isReg = false;
          }
          return;
        });
      });
    });
  }

  // GetFilteredEvents
  getFiltered(ev) {
    this.firestore.collection('events').valueChanges().subscribe(events => {
      this.events = events;
      this.events.sort(( a, b) => {
        const keyA = a.datetime;
        const keyB = b.datetime;
        if (keyA < keyB) {
          return -1;
        }
        if (keyA > keyB) {
          return 1;
        }
          return 0;
      });
      this.events.forEach(data => {
        const newData = data;
        this.checkState(data);
        this.checkFull(data);
        data.guests.forEach(guest => {
          if (this.userID === guest) {
            newData.isReg = true;
          } if (this.userID !== guest) {
            newData.isReg = false;
          }
          return;
        });
      });
      this.filter(ev);
    });
  }

  // Test Filter Function
  async filter(typ) {
    const result = this.events.filter(event => event.type === typ);
    console.log(result);
    this.events = result;
  }

  // ActionSheet Filter
  async actionFunction() {
    const actionSheet = await this.actionController.create({
      header: 'Filtern nach',
      buttons: [
        {
          text: 'Alle',
          icon: 'football',
          handler: () => {
            this.getEvents();
          }
        },
        {
          text: 'Nur Challenges',
          icon: 'podium',
          handler: () => {
              this.getFiltered('Challenge');
          }
        },
        {
          text: 'Nur Turniere',
          icon: 'trophy',
          handler: () => {
              this.getFiltered('Turnier');
          }
        },
        {
          text: 'Nur Matches',
          icon: 'ribbon',
          handler: () => {
              this.getFiltered('Match');
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  // CheckState of Event
  checkState(data) {
    if (data.already + data.guests.length >= data.min) {
      firebase.firestore().collection('events').doc(data.uid).update({
        eventState: true
      });
      return;
    } if (data.already + data.guests.length < data.min) {
      firebase.firestore().collection('events').doc(data.uid).update({
        eventState: false
      });
      return;
    }
  }

  // Check if Event is FULL
  checkFull(data) {
    if (data.already + data.guests.length < data.max) {
      firebase.firestore().collection('events').doc(data.uid).update({
        closed: false
      });
      return;
    }
    if (data.already + data.guests.length >= data.max) {
      firebase.firestore().collection('events').doc(data.uid).update({
        closed: true
      });
      return;
    }
  }

  // Register for Event
  eventReg(ev) {
    this.alertFunction(ev);
  }

  // Unregister
  unregister(ev) {
    this.unRegAlert(ev);
  }

  // getUser ID
  getUser() {
    this.userID = this.authService.getUser().uid;
  }

  async alertFunction(ev) {
    const alert = await this.alertController.create({
      header: 'Eventanmeldung',
      message: 'Du bist dabei dich für dieses Event anzumelden',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Nicht anmelden');
          }
        }, {
          text: 'Ok',
          handler: () => {
            this.register.eventReg(ev, this.userID);
          }
        }
      ]
    });

    await alert.present();
  }

  async unRegAlert(ev) {
    const alert = await this.alertController.create({
      header: 'Achtung',
      message: 'Du bist dabei dich für dieses Event abzumelden',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Nicht abmelden');
          }
        }, {
          text: 'Ok',
          handler: () => {
            this.register.eventDeleteReg(ev, this.userID);
          }
        }
      ]
    });

    await alert.present();
  }

}
