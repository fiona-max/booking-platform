import { Component } from '@angular/core';
import {NavbarComponent} from '../../shared/components/navbar-component/navbar-component';
import {FooterComponent} from '../../shared/components/footer-component/footer-component';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {

  searchForm = new FormGroup({
    origin: new FormControl('', Validators.required),
    destination: new FormControl('', Validators.required),
    adults: new FormControl(1, [Validators.required, Validators.min(1)]),
    children: new FormControl(0, [Validators.min(0)]),
    departure: new FormControl('', Validators.required),
    returnDate: new FormControl(''),
    travelClass: new FormControl('Economy'),
    maxPrice: new FormControl(0),
    currency: new FormControl('USD'),
  })
  destinations = [
    { name: 'Paris', description: 'Romantic city with iconic landmarks', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjO_Q62EpuS5mbvttvBph2n0wl06AsTfG28x18wu83LwCf3Z9zdDVLnotH6uCIyXEykD0vno5CjjIejxb0DzFtDcyGCgFelGoITjSMKWRN-MW_bZ3xgaQ5kL5R9QjHIxA-rL3Zn_V0RL5j2v9NN7KHn_NE6tcvlSHkTiT1zVTHBJIF1NRyjftsFgENmYcXuYSvYbZc0EOdr8XvmYh_Jmwymh-MWrl4sgcx72PEbt30xr8GbGoN0NxG-SDs5KvV_wXtKNmUo9TKXVA' },
    { name: 'Tokyo', description: 'Vibrant city with unique culture', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBaF5qCQceNv0obD2G6PqrdPLGR598jLnAoVRrDrqdtQi_QEGdsole1s5R82VJk5PgaKDhDcCBBAxOU8MMKEBZlI2AXYiiRft9OnFu6qn2j69zGivDjtixmVpa2uDNGvAVFk3SIRNlip_1iAi_Xk5N25knFJkRPAD78h8J3-rcMv2b47WTe_cZFZlMPu2gwiv9CT6g6auE1_p8vuIPSouYyF7lci-BZCN8ZhMLZgJ9hShTcqBu-d_MSia8w6G3hNkqljCn4CWsg4g' },
    { name: 'New York', description: 'The city that never sleeps', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAI9dLMCNAyePhdU_l465qk9ASb0BfhOGXY_i1CNh5VH1nUu2LTPp4Xc0YFAhFFIbIM9N_actTWTMEM2Yi6DrFjPDQ4SVUEJ1IIdfZcZ97L9_S3gKU5g4r1ebP30bKz78Js4kIXpWLBiIH1uU_etGQw5qxlIAExRw1M6r3etoQr3YBMTiEMArMUCZnHF1zjkvzxIFEwn2g1h6-rVhLZKiA-4toogHHiA6-g18umJR1abVNUOzDq8hc1o71SY0eJp9YYlYxrcN12nKs' },
  ];

  // Submit search
  onSearch() {
    if (this.searchForm.valid) {
      console.log('Search form values:', this.searchForm.value);
      // Here you can call your JSON server endpoint to fetch search results
    } else {
      console.log('Form is invalid');
    }
  }

}
