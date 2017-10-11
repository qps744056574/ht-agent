import { Component, OnInit } from '@angular/core';
import {ShoppingOrderComponent} from "../shopping-order.component";
import {PageEvent} from "../../../shared/directives/ng2-datatable/DataTable";
import {Page} from "../../../core/page/page";
import {SubmitService} from "../../../core/forms/submit.service";
import {ShoppingOrderService} from "../shopping-order.service";
import {RzhtoolsService} from "../../../core/services/rzhtools.service";
import {ModalContentComponent} from "../modal-content/modal-content.component";
import {BsModalRef, BsModalService} from "ngx-bootstrap";
const swal = require('sweetalert');
declare var $;
@Component({
  selector: 'app-wait-for-orders',
  templateUrl: './wait-for-orders.component.html',
  styleUrls: ['./wait-for-orders.component.scss']
})
export class WaitForOrdersComponent implements OnInit {

  public workOrderList: Page = new Page();                    //获取列表的数据
  public wono:string='';                                      //工单号
  public ordno:string='';                                     //订单号
  public stateEnum:string='';                                 //工单状态搜索时候会用到
  public stateEnumList;                                       //工单状态的列表
  bsModalRef: BsModalRef;
  public other: string;                                       //拒单的原因
  constructor(
    private parentComp:ShoppingOrderComponent,
    private submit: SubmitService,
    private shoppingOrderService: ShoppingOrderService,
    private rzhtoolsService: RzhtoolsService,
    private modalService: BsModalService
  ) { }

  /**
   * 1.设置当前点击的颜色
   * 2.获取当前状态的列表
   * 3.获取订单状态的列表，用来搜索
   */
  ngOnInit() {
    this.parentComp.orderType = 2;
    this.queryDatas();
    this.stateEnumList=this.rzhtoolsService.getEnumDataList(1305);
  }

  /**
   * 查询列表
   * @param event
   * @param curPage
   */
  public queryDatas(event?: PageEvent) {
    let _this = this, activePage = 1;
    if (typeof event !== 'undefined') {
      activePage = event.activePage;
    }
    let requestUrl = '/woAgent/query';
    let requestData = {
      sortColumns:'',
      curPage: activePage,
      pageSize: 15,
      agentCode:'',
      wono:this.wono,
      ordno:this.ordno,
      ordType:'ORD',//工单类型 购物订单
      stateEnum:this.stateEnum?this.stateEnum:'NO',
    };
    _this.workOrderList = new Page(_this.submit.getData(requestUrl, requestData));
  }


  /**
   * 接单
   * @param woAgengId 代理商工单id
   * 1. 刷新页面
   * 2.设置按钮的禁用和启用
   */
  toAccept(woAgengId){
    let that=this;
    swal({
        title: '确认接单吗？',
        type: 'info',
        confirmButtonText: '确认', //‘确认’按钮命名
        showCancelButton: true, //显示‘取消’按钮
        cancelButtonText: '取消', //‘取消’按钮命名
        closeOnConfirm: false  //点击‘确认’后，执行另外一个提示框
      },
      function () {  //点击‘确认’时执行
        swal.close(); //关闭弹框
        let url = '/woAgent/updateWoAgentToAccept';
        let data = {
          woAgengId:woAgengId
        };
        that.shoppingOrderService.toAcceptWork(url,data);
        that.queryDatas()
      }
    );
  }

  /**
   * 拒单的模态弹框
   */
  public toReject(woAgengId) {
    let list =  this.rzhtoolsService.getEnumDataList('1304');//获取异常工单也就是拒单的枚举
    this.bsModalRef = this.modalService.show(ModalContentComponent);
    this.bsModalRef.content.title = '请输入拒单的原因';
    this.bsModalRef.content.list = list;
    this.bsModalRef.content.other = this.other;
    this.bsModalRef.content.woAgengId = woAgengId;
    $(".modal").css({'top':'30%'})
  }


  /**
   * 获取搜索框选择的状态值
   * @param val
   */
  getState(val){
    this.stateEnum=val;
  }

  /**
   * 设置按钮的禁用和启用
   * @param obj
   * @param state
   */
  changeState(obj,state){
    if(state!='NO'){
      obj.disabled=true;
    }else{
      obj.disabled=false;
    }
  }

}
