var docs = {
    configuration: {
        "indent_size": "3",
        "indent_char": " ",
        "max_preserve_newlines": "5",
        "preserve_newlines": true,
        "keep_array_indentation": false,
        "break_chained_methods": false,
        "indent_scripts": "normal",
        "brace_style": "collapse",
        "space_before_conditional": true,
        "unescape_strings": false,
        "jslint_happy": false,
        "end_with_newline": false,
        "wrap_line_length": "0",
        "indent_inner_html": false,
        "comma_first": false,
        "e4x": false,
        "indent_empty_lines": false
    },
    controls: {
        form: $('#formExample1'),
        form2: $('#formExample2'),
    },
    variables: {
        textConsole: null
    },
    init: function () {
        $('.btn-clipboard').remove();
        docs.events();
        docs.setLink();
        docs.variables.textConsole = CodeMirror.fromTextArea(document.querySelector('#bodyConsole #textConsole'), {
            matchBrackets: true,
            autoCloseBrackets: true,
            mode: "application/ld+json",
            lineNumbers: true,
            readOnly: true,
        });

        docs.variables.textConsole2 = CodeMirror.fromTextArea(document.querySelector('#bodyConsole2 #textConsole2'), {
            matchBrackets: true,
            autoCloseBrackets: true,
            mode: "application/ld+json",
            lineNumbers: true,
        });

        docs.variables.textCodeHTML = CodeMirror.fromTextArea(document.querySelector('#textCodeHTML'), {
            lineNumbers: true,
            mode: "text/html",
            matchBrackets: true,
            readOnly: true
        });
        docs.variables.textCodeHTML2 = CodeMirror.fromTextArea(document.querySelector('#textCodeHTML2'), {
            lineNumbers: true,
            mode: "text/html",
            matchBrackets: true,
            readOnly: true
        });

        docs.variables.txtCodeJavascript = CodeMirror.fromTextArea(document.querySelector('#txtCodeJavascript'), {
            lineNumbers: true,
            mode: "javascript",
            matchBrackets: true,
            readOnly: true
        });

        docs.variables.txtCodeJavascript2 = CodeMirror.fromTextArea(document.querySelector('#txtCodeJavascript2'), {
            lineNumbers: true,
            mode: "javascript",
            matchBrackets: true,
            readOnly: true
        });

        docs.variables.txtIntegrar = CodeMirror.fromTextArea(document.querySelector('#txtIntegrar'), {
            lineNumbers: true,
            mode: "text/html",
            matchBrackets: true,
            readOnly: true,
        });

        $('.javascript-code').each(function (index, elemento) {
            console.log(elemento);
            var editor = CodeMirror.fromTextArea(elemento, {
                lineNumbers: true,
                mode: "javascript",
                matchBrackets: true,
                readOnly: true,
            });
            docs.variables[elemento.id] = editor;
            var string = beautifier.js(editor.getValue(), docs.configuration);
            editor.setValue(string);
        });
        docs.getFormData();
    },
    events: function () {
        docs.controls.form.on('submit', docs.callbacks.events.submitForm);
        docs.controls.form2.on('submit', docs.callbacks.events.submitForm2);
        $('.btn-clipboard').on('click', function () {
            var btn = $(this);
            var id = btn.parents('.bd-clipboard').next('textarea').attr('id');
            var str = docs.variables[id].getValue();
            str = str.substr(str.indexOf('{'));
            var el = document.createElement('textarea');
            el.value = str;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            btn.addClass('copied').html('Copiado');
            setTimeout(function () {
                btn.removeClass('copied').html('Copiar');
                document.body.removeChild(el);
            }, 2000);
        });
        $('#html-tab').on('click', function () {
            setTimeout(function () {
                docs.variables.textCodeHTML.refresh();
                var string = beautifier.html(docs.variables.textCodeHTML.getValue(), docs.configuration);
                docs.variables.textCodeHTML.setValue(string);
            }, 300);
        });
        $('#html-tab2').on('click', function () {
            setTimeout(function () {
                docs.variables.textCodeHTML2.refresh();
                var string = beautifier.html(docs.variables.textCodeHTML2.getValue(), docs.configuration);
                docs.variables.textCodeHTML2.setValue(string);
            }, 300);
        });

        $('#javascript-tab').on('click', function () {
            setTimeout(function () {
                docs.variables.txtCodeJavascript.refresh();
                var string = beautifier.js(docs.variables.txtCodeJavascript.getValue(), docs.configuration);
                docs.variables.txtCodeJavascript.setValue(string);
            }, 300);
        });

        $('#javascript-tab2').on('click', function () {
            setTimeout(function () {
                docs.variables.txtCodeJavascript2.refresh();
                var string = beautifier.js(docs.variables.txtCodeJavascript2.getValue(), docs.configuration);
                docs.variables.txtCodeJavascript2.setValue(string);
            }, 300);
        });
    },
    callbacks: {
        events: {
            submitForm: function (event) {
                event.preventDefault();
                docs.getFormData();
            },
            submitForm2: function (event) {
                event.preventDefault();
                try {
                    var string = docs.variables.textConsole2.getValue();
                    string = string.substr(string.indexOf('*/') + 2);
                    var obj = JSON.parse(string);
                    docs.controls.form2.fillForm(obj);
                } catch (ex) {
                    console.error(ex);
                    swal('Error', 'El objeto es inválido, se reestablecerá el objeto inicial.', 'error')
                            .then(function () {
                                docs.getFormData();
                            });
                }

            }
        }
    },
    setLink: function () {
        var loc = location.href;
        $('.bd-sidenav li a[href="' + location.href.replace(location.hash, '') + '"]').parent().addClass('active');
    },
    getFormData: function () {
        var obj = docs.controls.form.getFormData();
        console.log(obj);
        var string = JSON.stringify(obj);
        string = beautifier.js(string, docs.configuration);
        docs.variables.textConsole.setValue(string);
        docs.variables.textConsole2.setValue('/*\n   Modifica los valores del siguiente objeto y \n   haz clic en el botón "Actualizar Formulario"\n   de la izquierda.\n*/\n\n' + string);
    }
};
$(function () {
    docs.init();
});