import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { AuthErrorCodes } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  user$:any

  constructor(private toast:ToastController,
    private navController:NavController,
    private loadController:LoadingController,
    private afAuth:AngularFireAuth,
    private afStore:AngularFirestore
    ) {
      this.user$ = this.afAuth.authState.pipe(
        switchMap(user => {
          if(user) {
            return this.afStore.doc<any>(`usuarios/${user.uid}`).valueChanges();
          }
          else {
            return of(null);
          }
        })
      );
  }

  async login(email:string,password:string)
  {
    return await this.afAuth.signInWithEmailAndPassword(email,password)
  }

  async logout()
  {
    try {
      const loading = await this.loadController.create({
        message: "Cerrando sesión...",
        spinner: 'crescent',
        showBackdrop: true,
      });
      loading.present();

      this.afAuth.signOut().then(() => {
        setTimeout(() => {
          loading.dismiss();
          this.navController.navigateRoot('/login');
        }, 2000);
      });
    } catch (error) {
    }
  }

  obtenerError(error:any) {
    let mensaje = 'Ocurrió un error';

    switch (error.code)
    {
      case AuthErrorCodes.EMAIL_EXISTS:
        mensaje = "Este correo ya existe!"
        break;
      case AuthErrorCodes.USER_DELETED:
        mensaje = "No se encontro el usuario"
        break;
      case AuthErrorCodes.INVALID_EMAIL:
        mensaje = "Asegurese de ingresar un mail valido!"
        break;
      default:
        mensaje = "Se produjo un error!";
        break;
    }
  
    return mensaje;
  }

  async MostrarToast(encabezado:string,mensaje:string,color:string,icono:string)
  {
    const toast = await this.toast.create({
      header:encabezado,
      message: mensaje,
      duration: 2450,
      position: 'bottom',
      color: color,
      icon: icono
    });

    await toast.present();
  }
}
