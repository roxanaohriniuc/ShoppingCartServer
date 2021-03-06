var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var Product    = require('./app/models/product');
var Account    = require('./app/models/account');
var Order      = require('./app/models/order');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8800;

//Mongo Connection
mongoose.connect('mongodb://admin:admin@ds059694.mongolab.com:59694/roxapi');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// ROUTES FOR OUR API
var router = express.Router(); 

router.use(function(req, res, next) {
    console.log('Request received. ');
    next();
});

router.get('/', function(req, res) {
    res.json({ message: 'Object oriented shopping cart API.' });   
});

// =============================================================================
//object oriented shopping cart app
router.route('/inventory')
    .post(function(req, res) {
        var product = new Product();
        product.name = req.body.name;
        product.description = req.body.description;
        product.unitPrice = req.body.unitPrice;
        product.unitCost = req.body.unitCost;
        product.quantity = req.body.quantity;
        product.category = req.body.category;
        product.save(function(err) {
            if(err){
                res.send(err);
            }
            res.json({message:'Product added.'});
        });
})
    .get(function(req, res) {
        Product.find(function(err, inventory) {
            if(err){
                res.send(err);
            }
            res.json(inventory);
        });
});

router.route('/inventory/:product_id')
    .get(function(req, res){
        Product.findById(req.params.product_id, function(err, product) {
            if(err)
                res.send(err);
            res.json(product);
        });
    })
    .put(function(req, res){
        Product.findById(req.params.product_id, function(err, product){
        if(err)
            res.send(err);
        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.unitPrice = req.body.unitPrice || product.unitPrice;
        product.unitCost =  req.body.unitCost || product.unitCost;
        product.quantity =  req.body.quantity || product.quantity;
        product.category =  req.body.category || product.category;
        product.save(function(err){
            if(err)
                res.send(err);
            res.json({message: 'Product updated.'});
            });
        });
    })
    .delete(function(req, res){
        Product.remove({
            _id: req.params.product_id
        }, function(err, product){
            if(err)
                res.send(err);
            res.json({message: 'Product removed.'});
        });
    });

router.route('/accounts')
    .post(function(req, res){
    var account = new Account();
    account.name = req.body.name;
    account.username = req.body.username;
    account.password = req.body.password;
    account.email = req.body.email;
    account.admin = req.body.admin;
    account.shoppingcart = [];
    account.save(function(err) {
        if(err){
            res.send(err);
        }
        res.json({message:'Account added.'});
        });
    })
    .get(function(req, res) {
        Account.find(function(err, accounts){
            if(err){
                res.send(err);
            }
            res.json(accounts);
        });
    });

//this should be done with oauth2, ok for now
router.route('/accounts/:username/:password')
    .get(function(req, res){
        Account.findOne({'username' : { $regex : new RegExp(req.params.username, "i") }, 
                          'password' : req.params.password},
                         '_id username password name admin email shoppingcart',
                         function(err, account){
                            if(err)
                                res.send(err);
                            res.json(account);
                        });
    });

router.route('/accounts/:account_id')
    .get(function(req, res){
        Account.findById(req.params.account_id, function(err, account) {
            if(err)
                res.send(err);
            res.json(account);
        });
    })
    .put(function(req, res){
        Account.findById(req.params.account_id, function(err, account){
        if(err)
            res.send(err);
        account.name            = req.body.name || account.name;
        account.username        = req.body.username || account.username;
        account.password        = req.body.password || account.password;
        account.email            = req.body.email || account.email;
        account.admin           = req.body.admin || account.admin;
        account.shoppingcart    = req.body.shoppingcart || account.shoppingcart;
        account.save(function(err){
            if(err)
                res.send(err);
            res.json({message: 'Account updated.'});
            });
        });
    })
    .delete(function(req, res){
        Account.remove({
            _id: req.params.account_id
        }, function(err, account){
            if(err)
                res.send(err);
            res.json({message: 'Account deleted.'});
        });
    });

router.route('/orders')
    .post(function(req, res){
    var order = new Order();
    order.buyerId = req.body.buyerId;
    order.totalPrice = req.body.totalPrice;
    order.totalCost = req.body.totalCost;
    order.date = req.body.date;
    order.save(function(err) {
        if(err){
            res.send(err);
        }
        res.json({message:'Order created.'});
        });
    })
    .get(function(req, res) {
        Order.find(function(err, orders){
            if(err){
                res.send(err);
            }
            res.json(orders);
        });
    });

router.route('/shoppingcart')
    .post(function(req, res){
    Product.findById(req.body.productId, function(err, product){
        if(err || !product)
            res.send(err);
        else if(product.quantity > 0){//only if in inventory
            product.quantity--;//take out of inventory
            Account.findById(req.body.accountId, function(err, account){
                if(err || !account)
                    res.send(err);
                var exists = false;
                for(var i = 0; i < account.shoppingcart.length; i++)
                {
                    if(account.shoppingcart[i].productId == req.body.productId)
                    {
                        exists = true;
                        account.shoppingcart[i].quantity++;
                    }
                }
                if(!exists)
                {
                    account.shoppingcart.push({"productId" : req.body.productId,
                                               "quantity"  : 1});
                } 
                product.save(function(err){
                    if(err)
                        res.send(err);
                    var tempCart = account.shoppingcart;
                    account.shoppingcart = [];
                    account.save(function(err){
                        if(err)
                            res.send(err);
                        account.shoppingcart = tempCart;
                        account.save(function(err){
                            if(err)
                                res.send(err);
                        res.json(account.shoppingcart);
                        });
                    });
                });
            });
        }
        else
        {
            res.json({message :  "Product not in inventory."});
        }
    });
})
    .delete(function(req, res){
    Product.findById(req.body.productId, function(err, product){
        if(err||!product)
            res.send(err);
        else
        {           
            Account.findById(req.body.accountId, function(err, account){
                if(err||!account)
                    res.send(err);
                var index = 0;
                for(var i = 0; i < account.shoppingcart.length; i++)
                {
                    if(account.shoppingcart[i].productId == req.body.productId)          
                    {
                        index = i;
                        account.shoppingcart[i].quantity--;//take out of shoppingcart
                        product.quantity++;//add back to inventory
                    }
                }
                if(!account.shoppingcart[index].quantity)
                    account.shoppingcart.splice(index, 1);
                product.save(function(err){
                    if(err)
                        res.send(err);
                    var tempCart = account.shoppingcart;
                    account.shoppingcart = [];
                    account.save(function(err){
                        if(err)
                            res.send(err);
                        account.shoppingcart = tempCart;
                        account.save(function(err){
                            if(err)
                                res.send(err);
                        res.json(account.shoppingcart);
                        });
                    });
                });
            });
        }
    });
});
// =============================================================================

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);