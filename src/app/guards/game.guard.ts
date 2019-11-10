import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';

import { GameService } from '../services/game.service';

import { selectPlayerName } from '../store/selectors/player.selector';
import { AppStateInterface } from '../store/state/app.state';

@Injectable({
  providedIn: 'root'
})

export class GameGuard implements CanActivate {

  constructor(
    private gameService: GameService,
    private router: Router,
    private store: Store<AppStateInterface>
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {

    let isUsername: boolean;

    this.store.pipe(select(selectPlayerName)).subscribe(playerName => isUsername = playerName !== '');
    if (!isUsername) this.router.navigate(['/login']);
    return isUsername;
  }
}
