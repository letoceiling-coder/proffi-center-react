
$(document).ready(function (){

    $('#autz_client').click(function (){


        var name = $('#low_name').val();
        var password = $('#low_password').val();
        if (!name){
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "Заполните логин"
            }).show();
            return false;
        }else if (!password){
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "Введите пароль"
            }).show();
            return false;
        }else{
            jQuery.ajax({
                url: "/",
                async: false,
                data: {name:name,password:password,success:'autz_client'},
                dataType: 'json',
                type:"post",

                success: function(data) {

                    console.log(data)
                    if (data == null){
                        new Noty({
                            theme: 'relax',
                            timeout: 2000,
                            layout: 'topCenter',
                            type: "warning",
                            text: "НЕ ВЕРНЫЙ ЛОГИН ИЛИ ПАРОЛЬ"
                        }).show();
                    }else{
                        location.reload();
                    }

                },
                error: function(data) {
                    new Noty({
                        theme: 'relax',
                        timeout: 2000,
                        layout: 'topCenter',
                        type: "warning",
                        text: "Ошибка передачи данных"
                    }).show();
                }

            });
        }


    })

})
