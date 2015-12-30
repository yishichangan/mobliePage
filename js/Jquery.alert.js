(function () {
  $.MsgBox = {
    Alert: function (title, msg) {
      GenerateHtml("alert", title, msg);
      btnOk(); //alert只是弹出消息，因此没必要用到回调函数callback
      btnNo();
    },
    Confirm: function (title, msg, callback) {
      GenerateHtml("confirm", title, msg);
      btnOk(callback);
      btnNo();
    }
  }

  //生成Html
  var GenerateHtml = function (type, title, msg) {

    var _html = "";

    _html += '<div class="modal fade bs-example-modal-sm" id="msgAlert" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true" data-backdrop="static" style="z-index: 9999;"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><h4 class="modal-title" id="myModalLabel">' + title + '</span>';
    _html += '</h4></div><div class="modal-body">' + msg + '</div><div class="modal-footer">';

    if (type == "alert") {
      _html += '<button type="button" class="btn btn-primary btn-yes" data-dismiss="modal">确定</button>';
    }
    if (type == "confirm") {
      _html += '<button type="button" class="btn btn-primary btn-yes">确定</button>';
      _html += '<button type="button" class="btn btn-default btn-no">取消</button>';
    }
    _html += '</div></div></div></div>';

    //将_html添加到body
    if($('#msgAlert').length>1){
		alert(alertSlow);
	}else{
		$("body").find('#msgAlert, .modal-backdrop').remove().end().prepend(_html);
		$('#msgAlert').modal('show');
	}
  }

	$(document).on('hidden.bs.modal','#msgAlert', function () {
		$('#msgAlert').remove();
	})
  //确定按钮事件
  var btnOk = function (callback) {
	$('.btn-yes').on('click', function () {
		$('#msgAlert').modal('hide');
      if (typeof (callback) == 'function') {
        callback();
      } 
	})
  }

  //取消按钮事件
  var btnNo = function () {
      $('.btn-no').on('click', function () {
    	    $('#msgAlert').modal('hide');
	    })
  }
})();

