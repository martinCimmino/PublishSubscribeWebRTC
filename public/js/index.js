'use strict';
$(document).ready(function() {
	/*
	* Setup the correct layout for the two form
	*/
    $('#login-form-link').click(function(e) {
		$("#login-form").delay(100).fadeIn(100);
 		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
	$('#register-form-link').click(function(e) {
		$("#register-form").delay(100).fadeIn(100);
 		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});

	/*
	* SEND DATA TO THE ROUTE FOR THE REGISTRATION
	*/

	$("#register").click(function(){
		var user={};
		var username=$("#username-reg").val();
		var password=$("#password-reg").val();
		if($('#interest1:checkbox:checked').length > 0){
			user.interest1= $("#interest1").val();
		}
		if($('#interest2:checkbox:checked').length > 0){
			user.interest2= $("#interest2").val();
		}
		if($('#interest3:checkbox:checked').length > 0){
			user.interest3= $("#interest3").val();
		}
		if($('#interest4:checkbox:checked').length > 0){
			user.interest4= $("#interest4").val();
		}
		if(username != null && username !="" && password != null && password !=""){
			user.username= username;
			user.password= password;
		}else{
			alert("Username e/o password vuoti. La prego di riempire questi dati e riprovare");
			return;
		}

		$.ajax( {
			type: "POST",
			dataType: "json",
			contentType: 'application/json; charset=utf-8',
			url: '/signup',
			data: JSON.stringify(user)
		}).done( function (data) {
			alert(data.payload);
		});
	});


	/*
	* SEND DATA TO THE ROUTE FOR THE LOGIN
	*/
	$("#login-submit").click(function(){
		var log={};
		var username= $("#username-log").val();
		var password=$("#password-log").val();
		if(username !=null && username != "" && password != null && password !=""){
			log.username=username;
			log.password= password;
		} else {
			alert("Errore! Ci sono dei campi vuoti!");
			return;
		}
		$.ajax( {
			type: "POST",
			dataType: "json",
			contentType: 'application/json; charset=utf-8',
			url: '/login',
			data: JSON.stringify(log)
		}).done( function (data) {
			if(data.status=="Ok"){
				window.location.href = data.payload;
			} else {
				alert(data.payload);
			}
			
		});

	});



});
