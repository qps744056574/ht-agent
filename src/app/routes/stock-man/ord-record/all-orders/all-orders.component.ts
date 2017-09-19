import {Component, OnInit, ViewChild} from '@angular/core';
import {Page} from "../../../../core/page/page";
import {PageEvent} from "angular2-datatable";
import {isUndefined} from "util";
import {SubmitService} from "../../../../core/forms/submit.service";
import {OrdRecordComponent} from "../ord-record.component";

@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.scss']
})
export class AllOrdersComponent implements OnInit {
  public curCancelOrderId:string;
  public curDeliverOrderId:string;
  public lookLogisticsOrderId:string;
  private beginTime:string;
  private endTime:string;
  public goodsList: Page = new Page();
  constructor(private parentComp:OrdRecordComponent,
              private submit: SubmitService,) { }

  ngOnInit() {
    let me = this;
    me.parentComp.orderType = 1;
    me.queryDatas(1)
  }

  /**
   * 查询列表
   * @param event
   * @param curPage
   */
  public queryDatas(curPage, event?: PageEvent) {
    let _this = this, activePage = 1;
    if (typeof event !== 'undefined') {
      activePage = event.activePage;
    } else if (!isUndefined(curPage)) {
      activePage = curPage;
    }
    let requestUrl = '/goodsQuery/query';
    let requestData = {
      curPage: activePage,
      pageSize: 2,
      sortColumns: '',
    };
    _this.goodsList = new Page(_this.submit.getData(requestUrl, requestData));
  }

  /**
   * 显示买家信息
   * @param event
   * @param i
   */
  showUserInfo(i){
    i.style.display = 'block';
  }

  /**
   * 隐藏买家信息
   * @param i
   */
  hideBuyerInfo(i){
    i.style.display = 'none';
  }
  cancelOrder(orderId){
    this.curCancelOrderId = orderId;
  }
  deliverOrder(orderId){
    this.curDeliverOrderId = orderId;
  }
  lookLogistics(orderId){
    this.lookLogisticsOrderId = orderId;
  }
  /**
   * 取消订单回调函数
   * @param data
   */
  getCancelOrderData(data){
    this.curCancelOrderId = null;
  }

  /**
   * 发货回调函数
   * @param data
   */
  getDeliverOrderData(data){
    this.curDeliverOrderId = null;
  }
  /**
   * 查询物流回调函数
   * @param data
   */
  getLogisticsData(data){
    this.lookLogisticsOrderId = null;
  }
}
