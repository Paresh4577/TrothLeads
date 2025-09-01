import { Component } from '@angular/core';
import { RFQQuotationCategoryList } from '@config/rfq';

@Component({
  selector: 'gnx-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.scss']
})
export class QuotationComponent {

  public RFQQuotationCategoryList = RFQQuotationCategoryList //RFQ ALL category List with Qn doc. download

  /**
   * Download QN document
   * @param item 
   */
  public downloadQnDocument(item){
    let link = document.createElement("a");
    link.download = item.fileName;
    link.href = item.downLoadURL;    
    link.click();
  }

}
