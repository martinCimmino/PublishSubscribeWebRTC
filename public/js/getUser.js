$(document).ready(function() {
	var session={}
	
  	$.ajax({
			type: "GET",
			dataType: "json",
			contentType: 'application/json; charset=utf-8',
			url: '/getUser',
            async: false
		}).done( function (data) {
			//alert(JSON.stringify(data));
			setUser(data);
		});	

	function setUser(user) {
			session=user;
	}

    function changeImage() {
        var imageFiles = $("#images_url");
        var filesLength = $("#images_url").fileinput('getFilesCount');

        var myFormData = new FormData();
        var files = $("#images_url").fileinput('getFileStack');
        for(var i = 0; i < filesLength; i++) {
            myFormData.append('files'+i, files[i]);
        }
        if(filesLength == 0) {
            alert("No file to upload");
            return;
        }
        $.ajax({
            type: "POST",
            dataType: "json",
            url: '/updateImage',
            async: false,
            processData: false,
            cache: false,
            contentType: false,
            data: myFormData
        }).done( function (data) {
            if(data.status == "Ok") {
                alert(data.payload);
            } else {
                alert(data.payload);
            }
        }); 
    }

    function changePassword(id, old_pass) {
        var updated_user={};
        var old_password = $("#old_password").val();
        var new_password =$("#new_password").val();
        if(old_password == old_pass) {
            updated_user.new_password= new_password;
            updated_user._id = id;
        }
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            url: '/updatePassword',
            async: false,
            data: JSON.stringify(updated_user)
        }).done( function (data) {
            if(data.status == "Ok") {
                alert(data.payload);
            } else {
                alert(data.payload);
            }
        }); 
    }

    //setup fileinput
    $("#images_url").fileinput({
        previewFileType:'any',
        maxFileCount: 1,
        showUpload:false,
        browseClass: "btn btn-primary",
        browseLabel: "Inserisci immagine",
        browseIcon: "<i class=\"glyphicon glyphicon-picture\"></i> ",
        removeClass: "btn btn-danger",
        removeLabel: "Elimina",
        uploadClass: "btn btn-info",
        uploadUrl: "http://localhost/upload", 
        allowedFileExtensions: ["jpg"]
    });
    $(".file-drop-zone-title").empty();
    $(".file-drop-zone-title").append("Copia e incolla i tuoi file qui!");
    //hide preview icons
    $('#images_url').on('fileselect', function(event, numFiles, label) {
        $(".kv-file-upload").remove();
        $(".file-upload-indicator").remove();
        $(".kv-file-zoom").remove();
    });
    //hide preview icons
    $('#images_url').on('change', function(event, numFiles, label) {
        $(".kv-file-upload").remove();
        $(".file-upload-indicator").remove();
        $(".kv-file-zoom").remove();

    });

    $("#change_pass").on("click", function() {
        changePassword(session._id, session.password);
    });

    $("#upload").on("click", function() {
        changeImage();
    });
    //inserisci saluto all'utente appena entra sul profilo
    $('#ov_username').append('Ciao ' + session.username);
    if( session.url_image != null && session.url_image != undefined && session.url_image != "") {
        $("#img_profile").attr("src", "images/"+ session._id + "/" + session.username +".jpg");
    } else {
        $("#img_profile").attr("src", "images/default.jpg");
    }
	//aggiunto username sul profilo dell'utente
	$('#username-profile').text(session.username);
    //inserisci logout sulla navbar
	$('#nav-right').append("<li><a href='/logout'>Logout</a></li>");
	/*
	* aggiunta degli interessi dinamica
	*/
	switch (session.interest1) {
    case "Sport":
        $("#myInterest").append("<span class='label label-info'>Sport</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-info'>Sport</span>");
        $('#interessi').append('<br>');
        $("#categoria").append($("<option>", { 
        	text: 'Sport'}));
        break;
    case "News":
        $("#myInterest").append("<span class='label label-default'>News</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-default'>News</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
        	text: 'News'}));
        break;
    case "Gaming":
        $("#myInterest").append("<span class='label label-success'>Gaming</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-success'>Gaming</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
        	text: 'Gaming'}));
        break;
    case "Eventi":
        $("#myInterest").append("<span class='label label-danger'>Eventi</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-danger'>Eventi</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
        	text: 'Eventi'}));
        break;
	}

	switch (session.interest2) {
            case "Sport":
        $("#myInterest").append("<span class='label label-info'>Sport</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-info'>Sport</span>");
        $('#interessi').append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'Sport'}));
        break;
    case "News":
        $("#myInterest").append("<span class='label label-default'>News</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-default'>News</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'News'}));
        break;
    case "Gaming":
        $("#myInterest").append("<span class='label label-success'>Gaming</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-success'>Gaming</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'Gaming'}));
        break;
    case "Eventi":
        $("#myInterest").append("<span class='label label-danger'>Eventi</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-danger'>Eventi</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'Eventi'}));
        break;
	}
    
    switch (session.interest3) {
         case "Sport":
        $("#myInterest").append("<span class='label label-info'>Sport</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-info'>Sport</span>");
        $('#interessi').append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'Sport'}));
        break;
    case "News":
        $("#myInterest").append("<span class='label label-default'>News</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-default'>News</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'News'}));
        break;
    case "Gaming":
        $("#myInterest").append("<span class='label label-success'>Gaming</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-success'>Gaming</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'Gaming'}));
        break;
    case "Eventi":
        $("#myInterest").append("<span class='label label-danger'>Eventi</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-danger'>Eventi</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'Eventi'}));
        break;
    }

	switch (session.interest4) {
         case "Sport":
        $("#myInterest").append("<span class='label label-info'>Sport</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-info'>Sport</span>");
        $('#interessi').append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'Sport'}));
        break;
    case "News":
        $("#myInterest").append("<span class='label label-default'>News</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-default'>News</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'News'}));
        break;
    case "Gaming":
        $("#myInterest").append("<span class='label label-success'>Gaming</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-success'>Gaming</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'Gaming'}));
        break;
    case "Eventi":
        $("#myInterest").append("<span class='label label-danger'>Eventi</span>");
        $("#myInterest").append('<br>');
        $("#interessi").append("<span class='label label-danger'>Eventi</span>");
        $("#interessi").append('<br>');
        $("#categoria").append($("<option>", { 
            text: 'Eventi'}));
        break;
	}
	
});