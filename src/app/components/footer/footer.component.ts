import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  apiVersion: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchApiVersion();
  }

  private fetchApiVersion(): void {
    this.http.get('http://localhost:3001/api/version')
      .subscribe({
        next: (response: any) => {
          this.apiVersion = response.version;
        },
        error: (error) => {
          console.error('Error fetching API version:', error);
          this.apiVersion = 'Unknown';
        }
      });
  }
}
