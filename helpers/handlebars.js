var register = function(Handlebars) {
    var helpers = {
        if_eq: function(a, b, opts) {
            if (a == b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        },
        if_neq: function(a, b, opts) {
            if (a != b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        },
        incitement: function (inindex) {
            return inindex + 1
        }
    };

    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        for (var prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop]);
        }
    } else {
        return helpers;
    }

};

module.exports.register = register;
module.exports.helpers = register(null);