var mongoose        = require('mongoose');
var Schema          = mongoose.Schema;

var accountSchema    = new Schema({
    name : {        type: String,
                    validate: { validator: function(v){
                        return Boolean(v);},   
                    message: "Name required."}
           },
    username : {    type: String,
                    validate: { validator: function(v){
                        return Boolean(v);},   
                    message: "Username required."}
               },
    password : {    type: String,
                    validate: { validator: function(v){
                        return Boolean(v);},   
                    message: "Password required."}
               },
    email : {    type: String,
                    validate: { validator: function(v){
                        return Boolean(v);},   
                    message: "Email required."}
            },
    password: {    type: String,
                    validate: { validator: function(v){
                        return Boolean(v);},   
                    message: "Username required."}
               },
   shoppingcart : { type: Array,
                    default : []
                  },
    admin : {type: Boolean,
             default : false}
});

module.exports = mongoose.model('account', accountSchema); 