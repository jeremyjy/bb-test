<template>
<div >
    <img  src="http://www.qnsb.com/fzepaper/site1/qnsb/res/1/1/2010-08/12/B15/res05_attpic_brief.jpg" class="user-info-left"/>

    <span><b>小红花制度</b></span>

    <p>1.	在线签到(设备检测在线状态)+1（上限为1）</p>
    <p>2.	分享故事（推送或者下载到设备）+1 (上限为5)</p>
    <p>3.	交流（家庭圈）+1 朋友圈+1 (上限为2)</p>
    <p>4.	任务（玩具设备端听故事（包括口袋故事、云端故事、绘本故事、互动故事）+1 （上限为12个）</p>
    <p>5.	习惯培养（家长用户自定义习惯行为）+1 （上 限为6个）</p>
    <p>6.	添加朋友（设备）+1 （无上限）</p>

</div>



</template>

<style>
body, html,div {
    margin: 0px;
    padding: 0px;
    font-family: "微软雅黑";
}
.user {
    padding-left: 1em;
    padding-top: 1em;
    padding-bottom:1em;
    border-bottom: 1px solid #666666;
}
.user-info-left {
    display: inline-block;
    height: 6em;
    width: 7em;
    border-radius: 50%;
    vertical-align: text-bottom;
}

.user-info-right {
       display: inline-block;

   }
.user-info-table {
    display: table;
    border-collapse: collapse;
    font-size: 1em;
    margin-left: 1em;
}
.user-name {
    display: table-row;
    width: 180px;
}
.user-accumulation {
    display: table-row;
    width: 180px;
    padding-left: 10px;
    line-height: 40px;
}
.user-explain {
    display: table-row;
    width: 380px;
    padding-left: 10px;
}
.records {
    color: #666666;
    display: inline-block;
    font-size: 0.7em;
    vertical-align: text-bottom;
}
.flower-icon {
    width: 20px;
    height: 20px;
    vertical-align: sub;
    margin-left: 5px;
}
/* 领取小红花 */
.table-bottom {
    display: table;
    width: 100%;
    text-align: center;
    margin-left:auto;
    margin-right:auto;
    padding: 16px;
    border-bottom: 1px solid #666666;
    box-sizing: border-box;
}
.table-col1 {
    display: table-cell;
    vertical-align:middle;
    width: 20%;
}
.table-bottom-icon {
    width: 2.8em;
}
.table-col2 {
    display: table-cell;
    line-height: 1.7em;
}
.table-center {
    display: table;
    margin-left: 0.7em;
    text-align: left;
}
.table-center-row1 {
    display: table-row;
    font-size: 1em;
    font-weight: bold;
}
.table-center-row2 {
    display: table-row;
    font-size: 10px;
    color: #666666;
}

.inline-calendar-demo {
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(5px);
}

.is-week-list-0,.is-week-list-1,.is-week-list-2,.is-week-list-3,.is-week-list-4,.is-week-list-5,.is-week-list-6 {
  border-bottom: 1px solid #D81B60;
}
.inline-calendar td>span {
    display: inline-block;
    width: 26px;
    height: 26px;
    line-height: 26px;
    font-weight: bold;
    border-radius: 50%;
    text-align: center;
}
.record {
    background-size: 77%;
    background-image: url(https://o5omsejde.qnssl.com/demo/test1.jpg);
    background-repeat: no-repeat;
    background-position: center;
}



</style>
