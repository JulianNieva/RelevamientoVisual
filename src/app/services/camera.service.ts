import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FirestoreService } from './firestore.service';
import { Camera, CameraResultType, CameraSource, Photo} from '@capacitor/camera';
import { getStorage, ref, uploadString } from 'firebase/storage';
import * as moment from 'moment';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  user: any = null;
  loaded: boolean = false;

  constructor(
    private userService: UserService,
    private angularFirestorage: AngularFireStorage,
    private firestoreService: FirestoreService) {
    this.userService.user$.subscribe((user: any) => {
      if (user) {
        this.user = user;
      }
    });
  }

  async addNewToGallery(photo: any, type: number) {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
      webUseInput: true,
    });
    const storage = getStorage();
    const date = new Date().getTime();

    photo.hour = date;

    const nombre = `${this.user.perfil} ${date}`;
    const storageRef = ref(storage, nombre);
    const url = this.angularFirestorage.ref(nombre);

    this.loaded=true;
    uploadString(storageRef as any, capturedPhoto.dataUrl as any, 'data_url').then(() => {
      this.loaded=false;
      url.getDownloadURL().subscribe((url1: any) => {
        photo.pathFoto = url1;
        this.firestoreService.addPhoto(photo, type);
        this.userService.MostrarToast('¡Exito!','La foto fue subida con éxito', 'success','checkmark-circle-outline');
      });
    });
  } // end of addNewToGallery
}
