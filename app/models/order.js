var mongoose        = require('mongoose');
var Schema          = mongoose.Schema;

var orderSchema    = new Schema({
    date : { type : Date,
             default : Date()
           },
    totalPrice : { type : Number,
                    min : 0
                 },
    totalCost : { type : Number,
                    min : 0
                },
    buyerId : {type : String,
               validate: { 
                   validator: function(v){
                        return Boolean(v);},   
                    message: "Password required."}
              }
});

module.exports = mongoose.model('order', orderSchema); 