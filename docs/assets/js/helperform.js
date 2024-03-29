/*
 @author: Starlly
 Creado por Starlly Software : http://starlly.com.
 Licencia gratuita, mantenga este encabezado de archivo para no infringir los derechos
 de autor.
 */
var HelperForm = {
    useJQuery: typeof (jQuery) != 'undefined',
    CONSTANTS: {
        FILL_FORM: 'FILL_FORM',
        GET_FORM_DATA: 'GET_FORM_DATA'
    },
    configuration: {
        checkboxTrueValue: true,
        checkboxFalseValue: false,
    },
    utils: {
        /**
         * Recibe dos objetos, donde el dos será copiado en el objeto 1.
         * Generalmente la función de JQuery $.extends hace lo mismo, pero he visto que 
         * tiene problemas al tratar arreglos ya que simplemente reemplaza los del objeto 1
         * con los del objeto 2.
         * @param {type} obj1
         * @param {type} obj2
         * @returns mergedObject
         */
        mergeObj: function (obj1, obj2) {
            for (var key in obj2) {
                if (typeof obj2[key] != "number" && typeof obj2[key] != "undefined" && obj2[key] != null && obj2[key].constructor()) {
                    if (Array.isArray(obj2[key])) {
                        if (!obj1[key]) {
                            obj1[key] = [];
                        }
                        for (var i = 0; i < obj2[key].length; i++) {
                            obj1[key].push(obj2[key][i]);
                        }
                    } else {
                        if (typeof obj1[key] == "undefined") {
                            obj1[key] = new Object();
                        }
                        HelperForm.utils.mergeObj(obj1[key], obj2[key]);
                    }
                } else {
                    obj1[key] = obj2[key];
                }
            }
        },
        /**
         * Comprueba si un string es válido y hace un UpperCase a su contenido.
         * @param {type} string
         * @returns {String}
         */
        upperCase: function (string) {
            if (typeof string === 'string') {
                return string.toUpperCase();
            }
        }
    }
};

/**
 * Había creado un objeto para ejecutar las acciones del algoritmo pero supuce que
 * tendría problemas de referencia si se llama asincronamente desde varias sentencias 
 * por tanto empaqueté el objeto en un prototipo que me devuelve una instancia nueva 
 * por cada vez que se invoque el plugin.
 * Lo que para este algoritmo es escencial ya que cada formulario debe manejar 
 * una instancia diferente.
 * @returns {Objeto}
 */
HelperFormPrototype = function () {
    var HForm = {
        CONSTANTS: HelperForm.CONSTANTS,
        ELEMENT_TYPES: {
            SELECT: 'SELECT',
            CHECKBOX: 'CHECKBOX',
            RADIO: 'RADIO'
        },
        configuration: HelperForm.configuration,
        fillForm: {
            variables: {
                data: null
            },
            controls: {
                form: null
            },
            init: function (form, data) {
                HForm.fillForm.controls.form = form;
                HForm.fillForm.variables.data = data;
                HForm.fillForm.finder(form, '', data);
            },
            finder: function (form, parseKey, data) {
                if (data == null) {
                    return;
                }
//                $.each(data, function (name, val) {
//                    var $el = form.find('[name="' + parseKey + name + '"]');
//                    var type = $el.attr('type');
//                    if (typeof val === "object") {
//                        var key = parseKey + "" + name + ".";
//                        HForm.fillForm.finder(form, key, val);
//                    } else {
//                        HForm.fillForm.fill(type, $el, val);
//                    }
//                });
                for (var name in data) {
                    var selector = '[name="' + parseKey + name + '"]';
                    var el = HelperForm.useJQuery ? form.find(selector) : form.querySelector(selector);
                    var val = data[name];
                    if (HelperForm.useJQuery) {
                        el = el[0];
                    }
                    var type = (el && el.attributes['type']) ? el.attributes['type'].value : '';
                    if (typeof val === "object") {
                        var key = parseKey + "" + name + ".";
                        HForm.fillForm.finder(form, key, val);
                    } else {
                        HForm.fillForm.fill(type, el, val);
                    }
                }
            },
            fill: function (type, el, val) {
//                HForm.fillForm.utils.processMultiple(el, val);
                type = HelperForm.utils.upperCase(type);
                switch (type) {
                    case HForm.ELEMENT_TYPES.CHECKBOX:
                        HForm.fillForm.utils.process.checkbox(el, val);
                        break;
                    case HForm.ELEMENT_TYPES.RADIO:
                        HForm.fillForm.utils.process.radio(el, val);
                        break;
                    default:
                        HForm.fillForm.utils.process.defaultElement(el, val);
                        break;
                }
            },
            utils: {
                processMultiple: function ($el, val) {
                    if ($el.length > 1) {
                        for (var i = 0; i < $el.length; i++) {
                            var $elTemp = $el[i];
                            if (i >= 0) {
                                HForm.fillForm.fill(($elTemp.atributes['type'] ? $elTemp.atributes['type'].value : ''), $elTemp, val);
                            }
                        }
                    }
                },
                process: {
                    checkbox: function ($el, val) {
                        if (val == true || val == 1) {
                            $el.checked = true
                        } else {
                            $el.checked = false;
                        }
                    },
                    radio: function ($el, val) {
                        var selector = '[type="radio"][value="' + val + '"]';
                        var form = (HelperForm.useJQuery) ? HForm.fillForm.controls.form[0] : HForm.fillForm.controls.form;
                        var radio = form.querySelector(selector);
                        radio && (radio.checked = true);
                    },
                    defaultElement: function ($el, val) {
                        var callback = ($el.attributes['data-callback']) ? $el.attributes['data-callback'] : '';
                        if (callback) {
                            val = eval(callback + '("' + val + '", "' + HForm.CONSTANTS.FILL_FORM + '")');
                        }
                        $el.value = val;
                    }
                }
            }
        },
        getFormData: {
            variables: {
                object: new Object()
            },
            controls: {
                form: null,
                fields: null
            },
            init: function (form) {
                HForm.getFormData.controls.form = form;
                var selection = 'input,select,textarea';
                HForm.getFormData.controls.fields = (HelperForm.useJQuery) ? form.find(selection) : form.querySelectorAll(selection);
                HForm.getFormData.run();
                return HForm.getFormData.variables.object;
            },
            utils: {
                pushObject: function (name, val, nameEntity) {
                    if (!name) {
                        return;
                    }
                    var hasClass = typeof nameEntity === "string";
                    var parts = name.split(".");
                    var objFinal = null;
                    if (parts.length > 1) {
                        objFinal = HForm.getFormData.utils.processParts(name, val, objFinal, hasClass, nameEntity);
                    } else {
                        objFinal = HForm.getFormData.utils.processSimple(objFinal, hasClass, name, nameEntity, val);
                    }
                    HForm.utils.mergeObj(HForm.getFormData.variables.object, objFinal);
                },
                processParts: function (name, val, objFinal, hasClass, nameEntity) {
                    var parts = name.split(".");
                    var objTemp = new Object();
                    var temp = null;

                    for (var i = 0; i < parts.length; i++) {
                        if (i == 0) {
                            objTemp[parts[i]] = new Object();
                            temp = objTemp[parts[i]];
                        } else if (i == (parts.length - 1)) {
                            if (name.indexOf('[]') >= 0) {
                                if (!Array.isArray(temp[parts[i]])) {
                                    temp[parts[i]] = [];
                                }
                                temp[parts[i]].push(val);
                            } else {
                                temp[parts[i]] = val;
                            }
                        } else {
                            temp[parts[i]] = new Object();
                            temp = temp[parts[i]];
                        }
                    }
                    objFinal = new Object();
                    if (hasClass) {
                        objFinal[nameEntity] = objTemp;
                    } else {
                        objFinal = objTemp;
                    }
                    return objFinal;
                },
                processSimple: function (objFinal, hasClass, name, nameEntity, val) {
                    objFinal = new Object();
                    if (hasClass) {
                        if (name.indexOf('[]') >= 0) {
                            if (!HForm.getFormData.variables.object[nameEntity]) {
                                HForm.getFormData.variables.object[nameEntity] = new Object();
                            }
                            if (!Array.isArray(HForm.getFormData.variables.object[nameEntity][name])) {
                                HForm.getFormData.variables.object[nameEntity][name] = [];
                            }
                            HForm.getFormData.variables.object[nameEntity][name].push(val);
                        } else {
                            objFinal[nameEntity] = new Object();
                            objFinal[nameEntity][name] = val;
                        }
                    } else {
                        if (name.indexOf('[]') >= 0) {
                            if (!Array.isArray(HForm.getFormData.variables.object[name])) {
                                HForm.getFormData.variables.object[name] = [];
                            }
                            HForm.getFormData.variables.object[name].push(val);
                        } else {
                            objFinal[name] = val;
                        }
                    }
                    return objFinal;
                },
                processElement: function (form, el) {
                    var elementName = el.attributes['name'] ? el.attributes['name'].value : null;
                    var hasClass = ((el.attributes["data-class"]) ? true : false);
                    var entityName = ((hasClass) ? (el.attributes["data-class"] ? el.attributes["data-class"].value : '') + "." : null);
                    var type = HelperForm.utils.upperCase((el.attributes['type'] ? el.attributes['type'].value : ''));
                    switch (type) {
                        case HForm.ELEMENT_TYPES.RADIO:
                            HForm.getFormData.utils.process.radio(form, elementName, entityName);
                            break;
                        case HForm.ELEMENT_TYPES.CHECKBOX:
                            HForm.getFormData.utils.process.checkbox(el, elementName, entityName);
                            break;
                        default:
                            HForm.getFormData.utils.process.defaultElement(el, elementName, entityName);
                            break;
                    }
                },
                process: {
                    checkbox: function (el, elementName, entityName) {
                        HForm.getFormData.utils.pushObject(elementName, ((el.checked) ? HForm.configuration.checkboxTrueValue : HForm.configuration.checkboxFalseValue), entityName);
                    },
                    radio: function (form, elementName, entityName) {
                        var selector = '[name="' + elementName + '"]:checked';
                        var valTemp = (HelperForm.useJQuery) ? form.find(selector)[0] : form.querySelector(selector);
                        if (valTemp) {
                            valTemp = valTemp.value;
                            HForm.getFormData.utils.pushObject(elementName, valTemp, entityName);
                        }
                    },
                    defaultElement: function (el, elementName, entityName) {
                        var val = el.value;
                        var callback = (el.attributes['data-callback'] ? el.attributes['data-callback'].value : '');
                        if (callback) {
                            val = eval(callback + '("' + val + '", "' + HForm.CONSTANTS.GET_FORM_DATA + '")');
                        }
                        if (el.nodeName == (HForm.ELEMENT_TYPES.SELECT)) {
                            if (el.attributes['data-value'] && val.trim() == "") {
                                val = el.attributes['data-value'].value;
                            }
                        }
                        HForm.getFormData.utils.pushObject(elementName, val, entityName);
                    }
                }
            },
            run: function () {
                for (var i in HForm.getFormData.controls.fields) {
                    var el = HForm.getFormData.controls.fields[i];
                    if (typeof el === 'object' && i >= 0) {
                        HForm.getFormData.utils.processElement(HForm.getFormData.controls.form, el);
                    }
                }
            }
        },
        utils: HelperForm.utils
    };
    this.instance = HForm;
};


/**
 * Recibe un objeto y llena el formulario o contenedor que ha invocado el prototipo.
 * @param {type} obj : Recibe el objeto que se usará para llenar el formulario.
 * @returns {Element}
 */
var fillForm = function (data) {
    if (typeof this !== "object") {
        console.error("Error fillForm: El objeto seleccionado no es un elemento del DOM.");
        return;
    }
    var HForm = new HelperFormPrototype();
    HelperForm.useJQuery = typeof (jQuery) != 'undefined';
    return HForm.instance.fillForm.init(this, data);
};

/**
 * Al invocarse desde un formulario, este prototipo obtendrá el modelo de datos en un objeto JSON.
 * @returns {Object}
 */
var getFormData = function () {
    var HForm = new HelperFormPrototype();
    HelperForm.useJQuery = typeof (jQuery) != 'undefined';
    return HForm.instance.getFormData.init(this);
};

if (HelperForm.useJQuery) {
    $.fn.fillForm = fillForm;
    $.fn.getFormData = getFormData;
} else {
    Element.prototype.fillForm = fillForm;
    Element.prototype.getFormData = getFormData;
}