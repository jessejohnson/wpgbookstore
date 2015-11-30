(function(){
	//code goes here

	'use strict';

	angular.module('bookstoreapp', [])
	.constant('MANDRILL_BASE', 'https://mandrillapp.com/api/1.0/')
	.constant('WPG_EMAIL', 'choralmusicghana@gmail.com')
	.constant('WPG_TRANSACTION_NUMBER', '024-021-6666')
	.factory('listingService', listingServiceFunction)
	.factory('orderService', orderServiceFunction)
	.controller('mainCtrl', mainCtrlFunction);

	function listingServiceFunction($http){
		//api
		return {
			getBooks: getBooks
		}

		//private methods
		function getBooks(){
			var req = {
				method: 'GET',
				url: '/static/data/books.json'
			}
			return $http(req);
		}
	}

	function orderServiceFunction($http, MANDRILL_BASE, WPG_EMAIL, WPG_TRANSACTION_NUMBER){
		//api
		return {
			sendOrder: sendOrder
		}

		//private methods
		function sendOrder(order){
			var detailsString = "";
			var detailsHTML = "<table style='width:100%;border: 1px solid black;'><tr><th>Title</th><th>Qty</th><th>Unit Price</th></tr>";
			order.cart.forEach(function(item){
				detailsString += "Title: " + item.title + " Qty: " + item.qty + " Unit Price: " + item.amount + "\n";
				detailsHTML += "<tr><td>" + item.title + "</td><td>" + item.qty + "</td><td>" + item.amount + "</td></tr>";
			});
			//append end of table
			detailsHTML += "</table>";
			var msg = "Your order for \n" + detailsString + " was received! \n" + "Please transfer " + order.totalAmount + " cedis to "+ WPG_TRANSACTION_NUMBER + " from any valid mobile money agent with the following code: " + order.orderId + "\n Thank You!";
			var msgHTML = "<h1>Your order was received!</h1> <br><br>" 
			+ "<h3>Details</h3>"
			+ "<p>Ordering Number: " + order.phoneNumber + "</p>"
			+ "<p>Ordering Email: " + order.email + "</p>"
			+ "<p>Location: " + order.location + "</p>"
			+ detailsHTML
			+ "Please <strong>transfer " + order.totalAmount + " Ghana cedis to "+ WPG_TRANSACTION_NUMBER + " </strong> from any valid mobile money agent <strong>with the following code: " + order.orderId + "</strong><br><br> Thank You!";
			var mandrillPayload = {
				"key": "PQOiNGsllE7pF8uDhU8ZzQ",
				"message": {
					"html": msgHTML,
					"text": msg,
					"subject": "Order #" + order.orderId + " from " + order.phoneNumber,
					"from_email": WPG_EMAIL,
					"from_name": "Writer's Project of Ghana",
					"to": [
					{
						"email": order.email,
						"name": "Reader",
						"type": "to"
					}
					],
					"headers": {
						"Reply-To": "message.reply@example.com"
					},
					"important": true,
					"track_opens": true,
					"preserve_recipients": false,
					"bcc_address": "choralmusicghana@gmail.com",
					"metadata": {
						"website": "www.writersprojectghana.com"
					}
				},
				"async": false,
				"ip_pool": "Main Pool"
			}

			var req = {
				method: 'POST',
				url: MANDRILL_BASE + 'messages/send.json',
				data: mandrillPayload
			}
			return $http(req);
		}
	}

	function mainCtrlFunction($scope, listingService, orderService){

		$scope.currentBook = {};
		$scope.order = {};
		$scope.places = ['East Legon', 'Legon Campus', 'KNUST', 'Obuasi'];

		//load books first
		listingService.getBooks().then(function(success){
			//success
			$scope.list = success.data;
		}, function(error){
			//error
			console.log(error.data);
		});

		//use this function to select a book from the list
		//as the current item for operations
		$scope.selectBook = function(book){
			$scope.currentBook = book;
		}

		//use this function to add books to the cart
		$scope.addToCart = function(book){
			var exists = false;
			if($scope.order.cart == undefined){
				//new cart
				$scope.order.cart = [];
			}
			$scope.order.cart.forEach(function(b){
				if(b.id == book.id){
					exists = true;
					console.log(b.title + " exists!");
				}
			});

			if(!exists){
				$scope.order.cart.push(book);
			}
			console.log("Cart :", $scope.order.cart);
		}

		//use this function to view the cart
		$scope.viewCart = function(){
			if($scope.order.cart == undefined){
				$scope.order.cart = [];
			}
		}

		//use this function to create an order
		//to be sent to WPG
		$scope.makeOrder = function(){
			$scope.order.orderId = guid();
			$scope.order.orderDate = Date();
			var amount = 0;

			//calculate totalAmount
			$scope.order.cart.forEach(function(item){
				//multiplies the amount by the quantity being purchased
				amount += item.amount * item.qty;
			});
			$scope.order.totalAmount = Math.round(amount*100)/100 ;
			console.log($scope.order);


			//send order notice now

			orderService.sendOrder($scope.order).then(function(success){
				console.log(success);
				$('#orderModal').modal('show');
			}, function(error){
				console.log(error);
			});
			//after sending order,
			//show user order id..?
			$scope.finalOrderId = $scope.order.orderId;
		}

		function guid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16);
				//.substring(1);
			}
			return s4();
		}
	}
})();