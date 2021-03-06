import {Component, OnInit} from '@angular/core';
import {StockManService} from "../stock-man.service";
import {ActivatedRoute,Router} from "@angular/router";
import {HeaderComponent} from "app/layout/header/header.component";
import {isNullOrUndefined} from "util";
import {Location} from "@angular/common";
import {AppComponent} from "../../../app.component";
import {DataDictService} from "../../../core/services/data-dict.service";

declare var $:any;

@Component({
  selector: 'app-pay-page',
  templateUrl: './pay-page.component.html',
  styleUrls: ['./pay-page.component.scss']
})

export class PayPageComponent implements OnInit {

  public orderData:any;                  //订单的数据
  public payWay:any;                     //支付的方式，用来显示不同的页面
  public curWay:any;                     //当前选择的支付方式，传递给下个页面
  public ordno:any;                      //订单号
  public pay:any;                        //支付的价格
  public flag:boolean=true;             //图片的地址
  public accountData;                    //平台统一银行收款账户账号
  public bankData;                       //平台统一银行收款账户开户行
  public nameData;                       //平台统一银行收款账户名称
  public phoneData;                      //平台统一银行收款联系方式
  public payCon;

  constructor(
    public stockManService: StockManService,
    public router: Router,
    public headerComponent: HeaderComponent,
    public routeInfo:ActivatedRoute,
    public location:Location,
    public dataDictService: DataDictService,
  ) { }

  /**
   * 1.把数据拿出来进行请求，生成订单
   * 2.对支付方式进行赋值，根据不容的方式在，在同一个组件显示不同的页面
   * 3.监控路由的状态，决定是否显示二维码页面
   * 4.生成订单会刷新购物会减少，在执行刷新购物车的方法
   */
  ngOnInit() {
    let ordno = this.routeInfo.snapshot.queryParams['ordno'];           //获取进货记录未付款跳转过来的参数
    let transPayWay = this.routeInfo.snapshot.queryParams['payWay'];    //获取当前的订单的支付方式
    this.orderData=JSON.parse(sessionStorage.getItem('orderData'));
    if(transPayWay){                                                     //如果有地址栏传递过来的就用地址传递过来的
      this.payWay=transPayWay;                                           //支付的方式，用来显示不同的页面
    }else if(this.orderData){
      this.payWay=this.orderData.payWay;
    }
    if(ordno){
      this.bornOrder(ordno);
    }else{
      this.bornOrder();
    }//防止报错
    this.getRemitInfo();
    this.headerComponent.getShopTotal();//刷新购物车商品数量
  };

  /**
   * 获取汇款时的信息（从数据字典取出来）
   */
  getRemitInfo() {
    let url = '/datadict/loadInfoByCode';
    let accountData = { //平台统一银行收款账户账号
      code: 'plat_finace_receive_account'
    }
    this.accountData = this.dataDictService.getInfo(url, accountData);
    let bankData = { //平台统一银行收款账户开户行
      code: 'plat_finace_receive_bank'
    }
    this.bankData = this.dataDictService.getInfo(url, bankData);
    let nameData = { //平台统一银行收款账户名称
      code: 'plat_finace_receive_name'
    }
    this.nameData = this.dataDictService.getInfo(url, nameData);
    let phoneData = { //平台统一银行收款联系方式
      code: 'plat_finace_receive_phone'
    }
    this.phoneData = this.dataDictService.getInfo(url, phoneData);
  }

  /**
   * 生成订单
   */
  bornOrder(ordno?){
    let url = '/agentOrd/addAgentOrd';
    let payData=this.stockManService.bornOrder(url,this.orderData);//正常流程
    if(isNullOrUndefined(payData)||payData=='代理商购物车商品无查询数据'||payData=='订单商品编码和商品数量拼接字符串为空'){ //在用户刷新，或者下个页面返回,未付款跳转过来的时候会用到
      let url = '/agentOrd/loadByOrdno';
      let data={
        ordno:ordno?ordno:sessionStorage.getItem('ordno')
      };
      if(data.ordno){
        let payData=this.stockManService.getShopList(url,data);
        if(payData){
          this.ordno=payData.ordno;
          this.pay=payData.pay;
        }
      }else{
        this.router.navigateByUrl('/main/home/');//如果出现异常调到首页
        return;
      }
    }else if(payData=='购买商品不可批发商品'||payData=='购买商品包含已下架商品'){//处理商品失效的bug
      AppComponent.rzhAlt("error",payData);
      this.location.back();
      return;
    }else{                                                                //正常
      sessionStorage.setItem('ordno',payData.ordno);//把订单编码存起来，在用户刷新，或者下个页面返回的时候会用到
      this.ordno=payData.ordno;
      this.pay=payData.pay.toFixed(2);
    }
  }

  /**
   * 选择不同的在线付款方式执行的方法
   *
   * 1.右下角出现图片
   */
  changeStyle(obj){
    if( $(obj)[0].className.indexOf('b')>1){
      return;
    }else{
      $(obj).parents('._border').find(".b").removeClass("b");
      $(obj).addClass("b");
    }
  }

  /**
   * 点击进行支付
   * @param ordno  订单号
   */
  confirmPay(){
    let obj=$(".b");
    if( obj.parents("._pay")[0].className.indexOf('_wxPay')>1){
      this.curWay='_wxPay'; //微信支付
      sessionStorage.setItem('pay',this.pay);//把价钱存到内存里面，防止在地址栏篡改
      this.router.navigate(['/main/stockMan/do'],{ queryParams: { curWay: this.curWay,ordno:this.ordno} })
    } else{
      this.curWay='_aliPay';//支付宝支付;这里直接跳转，如果到下个页面，样式不好看
      let url = '/aliPay/getPrePayId';
      let data = {
        ordno: this.ordno,
        returnUrl:'/main/stockMan/callBack',
      };
      //页面不是只有一个form 所以要重现获取本页面的form
      this.payCon = this.stockManService.goPay(url, data).replace('<script>document.forms[0].submit();<\/script>','');

      setTimeout(()=>{
        $('._border').append(this.payCon);//追加到谁后面无所谓，因为立马就跳转了
        $('._border form').submit();
      },0)
    };

  }
}
