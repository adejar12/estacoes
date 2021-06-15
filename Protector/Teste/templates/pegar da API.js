document.addEventListener("DOMContentLoaded", async function () {

    $.ajax({
        url: 'http://127.0.0.1:5000//testeTESTE',
        data: {
            "teste": "sou apenas um teste"
        },
        type: 'POST',
        success: function (response) {
            let teste = response;
            console.log(JSON.parse(teste))
        },
        error: function (error) {
            console.log(error);
        }
    });


});
