var _inputNum = 0,
	_obj = null,
	_pasteObj = null;

function showPage(){
	
	$('.wrap_html').html(localStorage.htmlText);
	if($('.wrap_html .edit_wrapper:first').attr('data-input-num')){
		_inputNum = $('.wrap_html .edit_wrapper:first').attr('data-input-num')-0;
	} 
	var _html = '';
	var _id;
	$('.wrap_html .edit_wrapper').each(function(){
		_id = $(this).attr('id');
		_html += '<li class="list-group-item" data-page-num="'+_id.substring(4)+'"></li>';
	})
	if($('.audio_btn').length>0){
		var _src = $('#media').attr('src');
		$('#music').attr({'src':_src,'data-src':_src});
		$('#music')[0].pause();
		$('.audio_btn #media')[0].pause();
		$('.audio_btn').remove();
	}
	$('.wrap_html .has-anim').each(function(){
		$(this).css('animation',$(this).attr('data-animation').replace('running','')).removeAttr('data-animation');
	})
	$('.page_list ul').empty().append(_html);
	sort();
	var _liFirst = $('.page_list ul li:first');
	$('.wrapBox').empty();
	$('.wrap_html #page'+_liFirst.attr('data-page-num')).clone().appendTo('.wrapBox');
	_liFirst.addClass('active');
	$('.phoneBox .edit_wrapper .draggie').draggable({ containment: "parent",addClasses: false })
		  .resizable({ containment: "parent" })
		  .children('.ui-resizable-handle').hide();
}//显示取下来的内容函数

function sort(){
	var _wrap = $('.wrap_html .edit_wrapper');
	for(i=1;i<=_wrap.length;i++){
		_wrap.eq(i-1).attr('id','page'+i);
		$('.page_list li').eq(i-1).text('第'+i+'页').attr('data-page-num',i);
	}
	var _pageNum = $('.page_list ul li.active').attr('data-page-num');
	$('.wrapBox .edit_wrapper').attr('id','page'+_pageNum);
}

function pasteDelHtml(){
	_pasteObj = _obj.find('.editor').children('div').first();
	if(window.getSelection){
		window.getSelection().getRangeAt(0).surroundContents(document.createElement("span"));
	}else if(document.selection){
		insertHTML('<span>'+document.selection.createRange().text+'</span>');
	}
	$('#pasteEelHtml').empty().html(_pasteObj.html());
	_pasteObj.html('');
	setTimeout(function() {
		_pasteObj.html(_pasteObj.html().replace(/\<\/p>/g, '</p>/n'));
		var str = _pasteObj.text();
		$('#pasteEelHtml').find('span').after(str).remove();
		_pasteObj.html($('#pasteEelHtml').html().replace(/\/n/g, '<br />'));
	},1);
}//粘贴代码时过滤HTML代码函数

function insertHTML(html) { 
	if (document.selection.type.toLowerCase() != "none") { 
		document.selection.clear(); 
	} 
	document.selection.createRange().pasteHTML(html) ; 
} 

$(function(){

showPage();

//筛选字段排序
$(".todo-list").sortable({
	cursor: "move",
	placeholder: "sortable-placeholder",
	forcePlaceholderSize: true,
	handle: ".handle"
});




$('#temp_box').on('click','.thumbnail',function(){
	$(this).addClass('active').parent().siblings().children().removeClass('active');
}).on('click','.temp-btn',function(){
	var eaid = $('#temp_box').find('.active').children('img').attr('data-temp-id');
	$('#temp_box').modal('hide');
})

$('.musi_add').click(function(){
	$.ajax({
		url : 'getAttach.action',
		type:'POST',
		data: {
			id: _id,
			langType: _objLang.langType
		},beforeSend: function(){
			wait();
		},success:function(response, status, xhr){
			var json_comment = $.parseJSON(response);
			var _html = '<option value="nomusic">当前没有音乐，请上传</option>';
			if(json_comment.rows){
				_html = '<option value="nomusic">不添加音乐</option>';
				$.each(json_comment.rows,function(index,value){
					$.each(value.attachs,function(index,value){
						if(value.type>=50){
							var _url = value.url.substr(37);
							_html += '<option value="'+value.url+'" data-musi-id="'+value.rid+'">'+_url+'</option>';
						}
					})
				})
			}
			$('#add_musi_box .modal-body select').empty().append(_html);
			if($('#music').attr('data-src')){
				var _src = $('#music').attr('data-src');
				$('#music')[0].pause();
				$('#add_musi_box .modal-body select').val(_src.substring(14));
			}
		},
		error : function () {
			$.MsgBox.Alert("提示", "system error!");
		}
	})
	$('#add_musi_box').modal('show');
})

$('.musi-select').change(function(){
	$('#music').attr('src','/files/upload/'+$(this).children(':selected').val());
	$('#music')[0].pause();
})

$('.set-musi').click(function(){
	$('#music').attr('data-src',$('#music').attr('src'));
	$('#add_musi_box').modal('hide');
})

$('#add_musi_box').on('hide.bs.modal', function () {
	$('#music')[0].pause();
	$('#music').attr('src','');
})

$('[data-toggle="tooltip"]').tooltip().click(function(){
	_audio = $('#music')[0];
	if(_audio.paused){
		_audio.play();
	}else{
		_audio.pause();
	}
});

$('.page_list ul').sortable({ 
	update: function( event, ui ) {
		var _this = ui.item;
		var _activePageNum = _this.attr('data-page-num');
		var _targetPageNum = _this.prev().length>0 ? _this.prev().attr('data-page-num') : 0;
		if(_targetPageNum==0){
			$('.wrap_html #page'+_activePageNum).prependTo('.wrap_html');
		}else{
			$('.wrap_html #page'+_targetPageNum).after($('.wrap_html #page'+_activePageNum));
		}
		sort();
	} 
});

$('.page_add').click(function(){
	var _pageTotalNum = $('.page_list li').length;
	if(_pageTotalNum==0){
		$('.page_list ul').append('<li class="list-group-item active" data-page-num="1">第1页</li>');
		var _html = '<div class="edit_wrapper" id="page1" style=\'background-size: cover; background-position: 50% 50%;\'><ul class="edit_area ui-droppable list-unstyled" style="overflow: hidden;"></ul></div>';
		$('.wrapBox').append(_html);
		$('.wrap_html').append(_html);
	}else{
		var _this = $('.page_list li.active');
		var _pageNum = 0;
		_pageNum = _this.attr('data-page-num');
		var _editWrapper = $('.wrap_html > div#page'+_pageNum);
		_this.removeClass('active').after('<li class="list-group-item active" data-page-num=""></li>');
		$('.phoneBox .edit_wrapper .draggie').draggable('destroy')
										 .resizable('destroy')
										 .css('border-color','transparent');
		_editWrapper.after('<div class="edit_wrapper" style="background-size: cover; background-position: 50% 50%;"><ul class="edit_area ui-droppable list-unstyled" style="overflow: hidden;"></ul></div>').replaceWith($('.phoneBox .edit_wrapper'));
		sort();
		$('.wrap_html > div#page'+_pageNum).next().clone().appendTo('.wrapBox');
		$('.phoneBox .edit_wrapper .draggie').draggable({ containment: "parent",addClasses: false })
					  						 .resizable({ containment: "parent" })
					   						 .children('.ui-resizable-handle').hide();
	}
})

$('.page_del').click(function(){
	var _pageTotalNum = $('.page_list li').length;
	if(_pageTotalNum==0){
		$.MsgBox.Alert("提示", "当前没有页面可删除！");
	}else{
		var _this = $('.page_list li.active');
		var _pageNum = 0;
		_pageNum = _this.attr('data-page-num');
		if(_this.index()==0&&_pageTotalNum!=1){
			_this.next().mousedown();
		}else{
			_this.prev().mousedown();
		}
		_this.remove();
		$('.wrap_html > div#page'+_pageNum).remove();
		if($('.page_list li.active').length==0){
			$('.wrapBox').empty();
			$('.wrap_html').empty();
		}else{
			sort();
		}
	}
})

$('.page_list').on('mousedown','ul.page_num li',function(){
	if(_obj!=null){
		_obj=null;
		$('.btn-toolbar').attr('data-target','').remove();
	}
	var _this = $(this);
	var _acivePageNum = $('.page_list li.active').attr('data-page-num');
	var _pageNum = 0;
	_pageNum = _this.attr('data-page-num');
	_this.addClass('active').siblings().removeClass('active');
	$('.phoneBox .edit_wrapper .draggie')/*.draggable('destroy')*/
										 .resizable('destroy')
										 .css('border-color','transparent');
	$('.phoneBox .edit_wrapper .draggie .has-anim').css('animation',$('.phoneBox .edit_wrapper .draggie .has-anim').attr('data-animation'));									 
	$('.wrap_html > div#page'+_acivePageNum).replaceWith($('.phoneBox .edit_wrapper'));
	$('.wrap_html > div#page'+_pageNum).clone().appendTo('.wrapBox');
	$('.phoneBox .edit_wrapper .draggie').draggable({ containment: "parent",addClasses: false })
					  .resizable({ containment: "parent" })
					  .children('.ui-resizable-handle').hide();

})

$('input[name=RadioGroup]').click(function(){
	$('input[name=input-name]').val($(this).val());
})

$('.btn-cancel').click(function(){
	$(this).closest('form')[0].reset();
})

$('.phoneBox').on('mousedown','.draggie',function(e){
	$(this).draggable( "enable" );
	_this = $(this);
	_obj = _this;
	if(_obj.find('.editor').length>0){
		_obj.find('.editor').children('div').first()[0].onpaste = pasteDelHtml;	
	}
	if(_this.find('.editor').length!=0&&$('.btn-toolbar').attr('data-target')!=_this.find('.editor').attr('id')){
		$('.btn-toolbar').attr('data-target','').remove();
	}
	_this.css('border-color','#08a1ef').siblings().css('border-color','transparent').end().find('.editor').css('cursor','default');
	$('.ui-resizable-handle').hide();
	_this.find('.ui-resizable-handle').show();
	_this.find('.rotate-icon').show().end().siblings().find('.rotate-icon').hide();
	_this.find('.rotate-line').show().end().siblings().find('.rotate-line').hide();
	var _objDiv = _obj.children().first();
	var _name = _objDiv.css('animation-name');
	if($('.ani_list').is(':hidden')){
		$('.ani_list').show();
	}
	if(_name!='none'){
		if(_name=='fadeInLeft'||_name=='fadeInDown'||_name=='fadeInRight'||_name=='fadeInUp'){
			$('.ani-type option').eq(2).prop('selected',true);
			$('.dir-type option[value='+ _name +']').prop('selected',true);
			$('.ani_list li').eq(2).show();
		}else{
			$('.ani-type option[value='+ _name +']').prop('selected',true);
			$('.ani_list li').eq(2).hide();
		}
		$('#ani-time').val(_objDiv.css('animation-duration').substr(0,_objDiv.css('animation-duration').length-1));
		$('#ani-delay').val(_objDiv.css('animation-delay').substr(0,_objDiv.css('animation-delay').length-1));
		var _iteration = _objDiv.css('animation-iteration-count');
		if(_iteration=='infinite'){
			//$('#ani-iteration').val(1).prop('disabled',true);
			$('.cir-type option:last').prop('selected',true);
		}else{
			$('#ani-iteration').val(_iteration).prop('disabled',false);
			$('.cir-type option:first').prop('selected',true);
		}
		if($('.ani_list li:gt(1)').is(':hidden')){
			$('.ani_list li:gt(2)').show();
		}
	}else{
		$('.ani_list').find('form')[0].reset();
		$('.ani_list li:gt(1)').hide();
	}
}).on('click','.draggie',function(e){
	e.stopPropagation();
})

$(document).on('mouseup',function(e){
	if(_obj!=null){
		$(document).off('mousemove');
		$('body').css('cursor','');
		$('.rotate-icon:visible').parent().draggable({ containment: "parent",addClasses: false });
	}
})

$('.phoneBox').on('click',function(){
	_obj.find('.editor').wysiwyg_destroy();
	_obj = null;
	$('.draggie').css('border-color','transparent');
	$('.btn-toolbar').attr('data-target','').remove();
	$('.ui-resizable-handle').hide();
	$('.rotate-icon').hide();
	$('.rotate-line').hide();
	$('.ani_list').hide();
});

$('.draggie').draggable({ containment: "parent",addClasses: false })
			 .resizable({ containment: "parent" })
			 .find('.ui-resizable-handle').hide();

var _btnToolbar = '<div class="btn-toolbar" data-role="editor-toolbar">  <div class="btn-group">    <a class="btn dropdown-toggle first-child" data-toggle="dropdown" title="文字大小" aria-haspopup="true" aria-expanded="false">        <i class="glyphicon glyphicon-text-width"></i>        &nbsp;        <b class="caret"></b>		</a>      <ul class="dropdown-menu size-menu">            <li>                <a dropdown-toggle="" data-edit="fontSize 7" aria-haspopup="true" aria-expanded="false">                    48px                </a>            </li>            <li>                <a dropdown-toggle="" data-edit="fontSize 6" aria-haspopup="true" aria-expanded="false">                    32px                </a>            </li>            <li>                <a dropdown-toggle="" data-edit="fontSize 5" aria-haspopup="true" aria-expanded="false">                    24px                </a>            </li>            <li>                <a dropdown-toggle="" data-edit="fontSize 4" aria-haspopup="true" aria-expanded="false">                    18px                </a>            </li>            <li>                <a dropdown-toggle="" data-edit="fontSize 3" aria-haspopup="true" aria-expanded="false">                    16px                </a>            </li>            <li>                <a dropdown-toggle="" data-edit="fontSize 2" aria-haspopup="true" aria-expanded="false">                    13px                </a>            </li>            <li>                <a dropdown-toggle="" data-edit="fontSize 1" aria-haspopup="true" aria-expanded="false">                    12px                </a>            </li>        </ul>  </div>  <div class="btn-group">    <div class="dropdown">        <a class="btn dropdown-toggle" data-toggle="dropdown" title="文字颜色" aria-haspopup="true" aria-expanded="false">            <i class="glyphicon glyphicon-font color-btn">            </i>            &nbsp;            <b class="caret">            </b>        </a>        <ul class="dropdown-menu color-menu">        <li><a dropdown-toggle="" class="btn" data-edit="foreColor #000000" style="background-color: #000000" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #7e2412" style="background-color: #7e2412" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #ff5400" style="background-color: #ff5400" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #225801" style="background-color: #225801" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #0c529e" style="background-color: #0c529e" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #333333" style="background-color: #333333" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #b61b52" style="background-color: #b61b52" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #f4711f" style="background-color: #f4711f" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #3bbc1e" style="background-color: #3bbc1e" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #23a3d3" style="background-color: #23a3d3" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #888888" style="background-color: #888888" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #d34141" style="background-color: #d34141" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #f7951e" style="background-color: #f7951e" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #29b16a" style="background-color: #29b16a" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #97daf3" style="background-color: #97daf3" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #cccccc" style="background-color: #cccccc" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #ec7c7c" style="background-color: #ec7c7c" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #fdea02" style="background-color: #fdea02" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #79c450" style="background-color: #79c450" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #563679" style="background-color: #563679" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #ffffff" style="background-color: #ffffff" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #ffcccc" style="background-color: #ffcccc" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #d9ef7f" style="background-color: #d9ef7f" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn" data-edit="foreColor #c3f649" style="background-color: #c3f649" aria-haspopup="true" aria-expanded="false"></a></li><li><a dropdown-toggle="" class="btn glyphicon glyphicon-remove" data-edit="foreColor transparent" style="background-color: transparent" aria-haspopup="true" aria-expanded="false"></a></li></ul></div></div>  <div class="btn-group">    <a class="btn" data-edit="bold" title="加粗"><i class="icon-bold"></i></a>    <a class="btn" data-edit="italic" title="倾斜"><i class="icon-italic"></i></a>    <a class="btn" data-edit="strikethrough" title="Strikethrough"><i class="icon-strikethrough"></i></a>    <a class="btn" data-edit="underline" title="下划线"><i class="icon-underline"></i></a>  </div>  <div class="btn-group">    <a class="btn" data-edit="justifyleft" title="左对齐"><i class="icon-align-left"></i></a>    <a class="btn" data-edit="justifycenter" title="居中对齐"><i class="icon-align-center"></i></a>    <a class="btn" data-edit="justifyright" title="右对齐"><i class="icon-align-right"></i></a>    <a class="btn" data-edit="justifyfull" title="分散对齐"><i class="icon-align-justify"></i></a></div></div>';	 

$('.phoneBox').on('dblclick', '.editor', function (e) {
	$(this).focus().css('cursor','auto').closest('.draggie').draggable("disable");
	if($('.btn-toolbar').length!=0){
		$('.btn-toolbar').attr('data-target','').remove();
	}
	$(_btnToolbar).appendTo('body').attr('data-target',$(this).attr('id')).css('top',e.pageY-70);
	$(this).wysiwyg();
	$(this).closest('.draggie').find('.editor').wysiwyg_destroy();
}).on('blur', '.draggie div', function(){
	$(this).closest('.draggie').draggable({ containment: "parent",addClasses: false });
}).on('dblclick','img',function(){
	$('#add_img_box').modal('show');
}).on('dblclick','.inputbox',function(){
	var _this = $(this).next();
	var _value = _this.attr('placeholder');
	$('#add_input_box input[name=input-name]').val(_value).next().prop('checked',_this.hasClass('no-null'));
	$.each($('#add_input_box input[type=radio]'), function(index,value) {    
		$(this).prop('checked',$(this).val()==_value)
	});
	$('#add_input_box').modal('show');
}).on('dblclick','.buttonbox',function(){
	$('#add_button_box').modal('show').find('input').val($(this).next().text());
})


$('.add_list a').click(function(){
	var _html = '';
	var _this = $(this);
	if(_this.hasClass('delete')){
		if(_obj != null){
			$.MsgBox.Confirm("警告", "确定要删除吗？",function(){_obj.remove();_obj = null;});
			return false;
		}else{
			$.MsgBox.Alert("提示", "请选择要删除的对象！");
			return false;
		}
	}
	_obj = null;
	if(_this.hasClass('add_text')){
		_inputNum +=1;
		_html = '<div class="editor" id="#editor'+ _inputNum +'"><div align="left">双击此处进行编辑</div></div>';
	}else if(_this.hasClass('add_img')){
		$('#add_img_box').modal('show');
		return false;
	}else if(_this.hasClass('add_input')){
		$('#add_input_box').modal('show');
		return false;
	}else{
		$('#add_button_box').modal('show');
		return false;
	}
	$('.ui-droppable:visible').append('<li class="draggie" title="按住鼠标进行拖动，双击进行编辑"><div style="width: 100%; height: 100%; overflow: hidden;">'+ _html +'</div><div class="rotate-icon"></div><div class="rotate-line"></div></li>')
					  .children().last()
					  .draggable({ containment: "parent",addClasses: false })
					  .resizable({ containment: "parent" })
					  .children('.ui-resizable-handle').hide();
})

$('#add_img_box').on('click','.thumbnail',function(){
	$(this).addClass('active').parent().siblings().children().removeClass('active');
})

$('#add_img_box').on('show.bs.modal', function () {
	$.ajax({
		url : 'getAttach.action',
		type:'POST',
		data: {
			id: _id,
			langType: _objLang.langType
		},beforeSend: function(){
			wait();
		},success:function(response, status, xhr){
			var json_comment = $.parseJSON(response);
			if(json_comment.rows){
				var _html = '';
				$.each(json_comment.rows,function(index,value){
					$.each(value.attachs,function(index,value){
						if(value.type<50){
							_html += '<div class="col-md-3"><a class="thumbnail" href="javascript:void(0);"><img src="/files/upload/'+value.url+'" data-img-id="'+value.rid+'"></a></div>';
						}
					})
				})
				$('#add_img_box .modal-body').empty().append(_html);
			}
		},
		error : function () {
			$.MsgBox.Alert("提示", "system error!");
		}
	})
})

$('.insert-img,.insert-bgimg').click(function(){
	if($('#add_img_box a.active').length!=1){
		$.MsgBox.Alert("提示", "请选择一张图片！");
		return false;
	}
	var _src = $('#add_img_box a.active img').attr('src');
	if($(this).hasClass('insert-img')){
		if(_obj != null){
			_obj.find('img').attr('src',_src);
		}else{
			var _html = '<li class="draggie" title="按住鼠标进行拖动，双击进行编辑" style="width: 150px; height: 150px;"><div style="width: 100%; height: 100%; overflow: hidden;"><div class="imgbox"><img src="'+ _src +'"></div></div><div class="rotate-icon"></div><div class="rotate-line"></div></li>';
			$('.ui-droppable:visible').append(_html)
						  .children().last()
						  .draggable({ containment: "parent",addClasses: false })
						  .resizable({ containment: "parent" })
						  .children('.ui-resizable-handle').hide();
		}
	}else{
		$('.edit_wrapper:visible').css('background-image','url('+ _src +')');
	}
	$('#add_img_box').modal('hide').find('.active').removeClass('active');
})

$('.del-bgimg').click(function(){
	$('.edit_wrapper:visible').css('background-image','');
})

$('.insert-input').click(function(){
	var _class = '';
	if($('#add_input_box input[type=checkbox]').prop('checked')==true){
		_class = 'no-null';
	}
	var _html = '<input type="text" value="" class="'+ _class +'" name="'+ $('#add_input_box input[name=input-name]').val() +'" placeholder="'+ $('#add_input_box input[name=input-name]').val() +'">';
	if(_obj!=null){
		_obj.find('input').replaceWith(_html);
	}else{
		$('.ui-droppable:visible').append('<li class="draggie" title="按住鼠标进行拖动，双击进行编辑"><div style="width: 100%; height: 100%; overflow: hidden;"><div class="inputbox" style="position: absolute; width: 100%; height: 100%;"></div>'+ _html +'</div><div class="rotate-icon"></div><div class="rotate-line"></div></li>')
					  .children().last()
					  .draggable({ containment: "parent",addClasses: false })
					  .resizable({ containment: "parent" })
					  .children('.ui-resizable-handle').hide();
	}
	$('#add_input_box').modal('hide').find('form')[0].reset();
})

$('.insert-button').click(function(){
	var _html = '<button name="submit">'+ $('#add_button_box input[name=button-name]').val() +'</button>';
	if(_obj!=null){
		_obj.find('button').replaceWith(_html);
	}else{
		$('.ui-droppable:visible').append('<li class="draggie" title="按住鼠标进行拖动，双击进行编辑"><div style="width: 100%; height: 100%; overflow: hidden;"><div class="buttonbox" style="position: absolute; width: 100%; height: 100%;"></div>'+ _html +'</div><div class="rotate-icon"></div><div class="rotate-line"></div></li>')
					  .children().last()
					  .draggable({ containment: "parent",addClasses: false })
					  .resizable({ containment: "parent" })
					  .children('.ui-resizable-handle').hide();
	}
	$('#add_button_box').modal('hide').find('form')[0].reset();
})

$('.ani-type, .dir-type').change(function(){
	var _this = $(this);
	var _name = _this.children(':selected').val();
	var _objDiv = _obj.children().first();
	if(_obj!=null){
		if(_objDiv.css('animation')==''||_objDiv.css('animation')=='none 0s ease 0s 1 normal none'){
			_objDiv.css('animation','undefined 1s ease 0s normal backwards 1').addClass('has-anim');
		}
		if(_name=='undefined'){
			$('.ani_list li:gt(1)').hide();
			$('.ani_list').find('form')[0].reset();
			_objDiv.css('animation','').removeClass('has-anim');
			return false;
		}else{
			if(_name=='fadeInLeft'||_name=='fadeInDown'||_name=='fadeInRight'||_name=='fadeInUp'){
				_this.parent().siblings().show();
			}else{
				_this.parent().next().hide().siblings().show();
				$('.dir-type option:first').prop('selected',true);
			}
		}
		_objDiv.css('animation-name',_name);
	}
});

$('#ani-time').keyup(function(){
	_obj.children().first().css('animation-duration',$(this).val()+'s');
})

$('#ani-delay').keyup(function(){
	_obj.children().first().css('animation-delay',$(this).val()+'s');
})

$('#ani-iteration').keyup(function(){
	_obj.children().first().css('animation-iteration-count',$(this).val());
})

$('.cir-type').change(function(){
	var _this = $(this);
	if(_this.children(':selected').val()=='1'){
		_obj.children().first().css('animation-iteration-count','infinite');
	}else{
		_obj.children().first().css('animation-iteration-count',$(this).val());
	}
	$('#ani-iteration').prop('disabled',_this.children(':selected').val()=='1');
})

$('.save-all').click(function(){
	var _this = $('.page_list li.active');
	var _pageNum = 0;
	_pageNum = _this.attr('data-page-num');
	var _editWrapper = $('.wrap_html > div#page'+_pageNum);
	$('.phoneBox .edit_wrapper .draggie').draggable('destroy')
										 .resizable('destroy')
										 .css('border-color','transparent');
	_editWrapper.replaceWith($('.phoneBox .edit_wrapper').clone());
	$('.wrap_html .has-anim').each(function(){
		$(this).attr('data-animation',checkAnim($(this)[0])).css('animation','');
	})
	$('.phoneBox .edit_wrapper .draggie').draggable({ containment: "parent",addClasses: false })
					  .resizable({ containment: "parent" })
					  .children('.ui-resizable-handle').hide();
	var _audioBox = '';
	if($('#music').attr('data-src')&&$('#music').attr('data-src')!='/files/upload/nomusic'){
		_audioBox = '<div class="audio_btn open"><div class="audio_icon rotate"></div><audio preload="" autoplay="autoplay" id="media" src=".'+$('#music').attr('data-src')+'" loop=""></audio></div>';
	}
	$('.wrap_html .edit_wrapper:first').attr('data-input-num',_inputNum);
	$('.wrap_html').next().val(_audioBox + $('.wrap_html').html());
	if(localStorage.htmlText){
		localStorage["htmlText"] = $('.wrap_html').next().val();
	}else{
		localStorage.htmlText = $('.wrap_html').next().val();
	}
	console.log(localStorage.htmlText);
	$.MsgBox.Alert("提示", "保存成功!");
})

$('.preview').click(function(){
	$.MsgBox.Confirm("提示", "确定保存了所有吗？",function(){});
})

$('.publish').click(function(){
	$.MsgBox.Confirm("提示", "确定保存了所有吗？",function(){});
})

});

function checkAnim(obj){
	if(null!=obj.style.animation){
		return obj.style.animation;
	}
	if(null!=obj.style.WebkitAnimation){
		return obj.style.WebkitAnimation;
	}
}

