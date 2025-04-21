import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameService } from '../../services/game.service';
import { ResultsData } from '../../services/results.service';

type RoundKey = 'round1' | 'round2' | 'round3';

@Component({
    selector: 'app-results',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
    results?: ResultsData;
    rounds: RoundKey[] = ['round1', 'round2', 'round3'];

    constructor(private gameService: GameService) { }

    ngOnInit() {
        this.gameService.getResults().subscribe(results => {
            this.results = results;
        });
    }
}
