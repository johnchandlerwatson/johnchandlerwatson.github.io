class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distance(coordinate) {
        return Math.sqrt(Math.pow(coordinate.x - this.x, 2) + Math.pow(coordinate.y - this.y, 2));
    }

    equals(coordinate) {
        return Math.floor(this.x) == Math.floor(coordinate.x) && Math.floor(this.y) == Math.floor(coordinate.y);
    }
}

class Chef {
    constructor(ctx, coordinate, kitchen) {
        this.ctx = ctx;
        this.coordinate = coordinate;
        this.kitchen = kitchen;
        this.order;
        this.holdingOrder = false;
        this.grill;
        this.destination;
        this.x;
        this.y;
        this.movementSpeed = 2;
    }

    draw() {
        this.move();
    }

    drawHat() {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(this.coordinate.x, this.coordinate.y, 15, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }

    move() {
        if (this.destination) {
            if (this.hasMetDestination() ) {
                this.destination = null;
            } else {
                this.followPath(this.destination);
            }
        } else {
            this.checkForDirective();
        }
        this.drawHat();
    }

    hasMetDestination() {
        return this.coordinate.equals(this.destination);
    }

    shouldGrabCookedDish() {
        return this.grill && this.grill.isOn() == false && this.grill.hasDish == true && this.coordinate.equals(this.grill.coordinate);
    }

    shouldDropOffCookedDish() {
        return this.grill && this.coordinate.equals(this.getDropOffLocation());
    }

    shouldGrabOrder() {
        return this.order && !this.grill && this.coordinate.equals(this.order.coordinate) && this.holdingOrder == false;
    }

    shouldHeadToGrill() {
        return this.order && !this.grill && this.holdingOrder == true;
    }

    shouldTurnOnGrill() {
        return this.grill && this.coordinate.equals(this.grill.coordinate) && this.grill.isOn() == false && this.grill.hasDish == false;
    }

    shouldHeadToOrder() {
        return !this.order && this.kitchen.grillIsAvailable() && !this.destination;
    }

    checkForDirective() {
        if (this.shouldHeadToOrder()) {
            this.headToOrder();
        } else if (this.shouldGrabOrder()) {
            this.grabOrder();
        } else if (this.shouldHeadToGrill()) {
            this.headToGrill();
        } else if (this.shouldTurnOnGrill()) {
            this.turnOnGrill();
        } else if (this.shouldGrabCookedDish()) {
            this.grabCookedDish();
        } else if (this.shouldDropOffCookedDish()) {
            this.dropOffCookedDish();
        }
    }

    getDropOffLocation() {
        var table = this.kitchen.orders;
        return new Coordinate(this.coordinate.x, table.startY + table.height/2)
    }

    grabOrder() {
        this.holdingOrder = true;
        this.kitchen.orders.orders.shift();
    }

    headToGrill() {
        var unclaimedGrill = this.kitchen.getUnclaimedGrill();
        if (unclaimedGrill) {
            unclaimedGrill.isClaimed = true;
            this.grill = unclaimedGrill;
            this.destination = unclaimedGrill.coordinate;
        }
    }

    turnOnGrill() {
        this.holdingOrder = false;
        this.grill.cook();
        this.grill.isClaimed = true;
    }

    headToOrder() {
        var unclaimedOrder = this.kitchen.getUnclaimedOrder();
        if (unclaimedOrder) {
            unclaimedOrder.isClaimed = true;
            this.order = unclaimedOrder;
            this.destination = this.order.coordinate;
        }
    }

    headToCookedDish() {
        var grill = this.kitchen.getGrillWithCookedDish();
        grill.isClaimed = true;
        this.destination = grill.coordinate;
        this.grillWithCookedDish = grill;
    }

    dropOffCookedDish() {
        this.kitchen.store.addSale();
        this.reset();
    }

    grabCookedDish() {
        this.grill.takeDish();
        this.grill.isClaimed = false;
        this.destination = this.getDropOffLocation();
    }

    reset() {
        this.grill = null;
        this.grillWithCookedDish = null;
        this.order = null;
        this.holdingOrder = false;
    }

    followPath(coordinate) {
        var xDis = dist(coordinate.x, this.coordinate.x);
        var yDis = dist(coordinate.y, this.coordinate.y);

        if (xDis > yDis) {
            if (this.coordinate.x < coordinate.x) {
                if (xDis < this.movementSpeed) {
                    this.coordinate.x += xDis;
                } else {
                    this.coordinate.x += this.movementSpeed;
                }
            } else {
                this.coordinate.x -= this.movementSpeed;
            }
        } else {
            if (this.coordinate.y < coordinate.y) {
                if (yDis < this.movementSpeed) {
                    this.coordinate.y += yDis;
                } else {
                    this.coordinate.y += this.movementSpeed;
                }
            } else {
                this.coordinate.y -= this.movementSpeed;
            }
        }

        function dist(point1, point2) {
            return Math.sqrt(Math.pow(point1 - point2, 2));
        }
    }
}

class SuperChef {
    constructor(ctx, coordinate, kitchen) {
        this.ctx = ctx;
        this.coordinate = coordinate;
        this.kitchen = kitchen;
        this.order;
        this.holdingOrder = false;
        this.grill;
        this.grillWithCookedDish;
        this.destination;
        this.x;
        this.y;
        this.movementSpeed = 2;
        var table = this.kitchen.orders;
    }

    draw() {
        this.move();
    }

    drawHat() {
        const ctx = this.ctx;
        var img = document.getElementById("super-chef");
        ctx.drawImage(img, 0, 0, 30, 38, this.coordinate.x, this.coordinate.y, 30, 38);       
    }

    move() {
        if (this.destination) {
            if (this.hasMetDestination() ) {
                this.destination = null;
            } else {
                this.followPath(this.destination);
            }
        } else {
            this.checkForDirective();
        }
        this.drawHat();
    }

    hasMetDestination() {
        return this.coordinate.equals(this.destination);
    }

    shouldHeadForCookedDish() {
        var grillWithCookedDish = this.kitchen.getGrillWithCookedDish();
        return grillWithCookedDish && !this.destination;
    }

    shouldGrabCookedDish() {
        return this.grillWithCookedDish && this.coordinate.equals(this.grillWithCookedDish.coordinate);
    }

    shouldDropOffCookedDish() {
        return this.grillWithCookedDish && this.coordinate.equals(this.getDropOffLocation());
    }

    shouldGrabOrder() {
        return this.order && !this.grill && this.coordinate.equals(this.order.coordinate) && this.holdingOrder == false;
    }

    shouldHeadToGrill() {
        return this.order && !this.grill && this.holdingOrder == true;
    }

    shouldTurnOnGrill() {
        return this.grill && this.coordinate.equals(this.grill.coordinate);
    }

    shouldHeadToOrder() {
        return !this.order && this.kitchen.grillIsAvailable() && !this.destination;
    }

    checkForDirective() {
        if (this.shouldDropOffCookedDish()) {
            this.dropOffCookedDish();
        } else if (this.shouldTurnOnGrill()) {
            this.turnOnGrill();
        } else if (this.shouldGrabCookedDish()) {
            this.grabCookedDish();
        } else if (this.shouldHeadForCookedDish()) {
            this.headToCookedDish();
        } else if (this.shouldGrabOrder()) {
            this.grabOrder();
        } else if (this.shouldHeadToGrill()) {
            this.headToGrill();
        }  else if (this.shouldHeadToOrder()) {
            this.headToOrder();
        }
    }

    getDropOffLocation() {
        var table = this.kitchen.orders;
        return new Coordinate(this.coordinate.x, table.startY + table.height/2)
    }

    grabOrder() {
        this.holdingOrder = true;
        this.kitchen.orders.orders.shift();
    }

    headToGrill() {
        var unclaimedGrill = this.kitchen.getUnclaimedGrill();
        if (unclaimedGrill) {
            unclaimedGrill.isClaimed = true;
            this.grill = unclaimedGrill;
            this.destination = unclaimedGrill.coordinate;
        }
    }

    turnOnGrill() {
        this.holdingOrder = false;
        this.grill.cook();
        this.grill.isClaimed = false;
        this.grill = null;
        this.order = null;
    }

    headToOrder() {
        var unclaimedOrder = this.kitchen.getUnclaimedOrder();
        if (unclaimedOrder) {
            unclaimedOrder.isClaimed = true;
            this.order = unclaimedOrder;
            this.destination = this.order.coordinate;
        }
    }

    headToCookedDish() {
        var grill = this.kitchen.getGrillWithCookedDish();
        grill.isClaimed = true;
        this.destination = grill.coordinate;
        this.grillWithCookedDish = grill;
    }

    dropOffCookedDish() {
        this.kitchen.store.addSale();
        this.reset();
    }

    grabCookedDish() {
        this.grillWithCookedDish.takeDish();
        this.grillWithCookedDish.isClaimed = false;
        this.destination = this.getDropOffLocation();
    }

    reset() {
        this.grill = null;
        this.grillWithCookedDish = null;
        this.order = null;
        this.holdingOrder = false;
    }

    followPath(coordinate) {
        var xDis = dist(coordinate.x, this.coordinate.x);
        var yDis = dist(coordinate.y, this.coordinate.y);

        if (xDis > yDis) {
            if (this.coordinate.x < coordinate.x) {
                if (xDis < this.movementSpeed) {
                    this.coordinate.x += xDis;
                } else {
                    this.coordinate.x += this.movementSpeed;
                }
            } else {
                this.coordinate.x -= this.movementSpeed;
            }
        } else {
            if (this.coordinate.y < coordinate.y) {
                if (yDis < this.movementSpeed) {
                    this.coordinate.y += yDis;
                } else {
                    this.coordinate.y += this.movementSpeed;
                }
            } else {
                this.coordinate.y -= this.movementSpeed;
            }
        }

        function dist(point1, point2) {
            return Math.sqrt(Math.pow(point1 - point2, 2));
        }
    }
}

class Orders {
    constructor(ctx, coordinate) {
        this.ctx = ctx;
        this.coordinate = coordinate;
        this.width = 900;
        this.height = 60;
        this.startY = 300;
        this.orders = [];
    }

    draw() {
        this.drawTable();
        this.drawOrders();
    }

    addOrder() {
        //remap existing orders
        for (var i=0; i<this.orders.length; i++) {
            this.orders[i].coordinate.x = this.getNewOrderX(i);
        }
        var newOrder = new Coordinate(this.getNewOrderX(this.orders.length),this.startY);
        this.orders.push(new Order(this.ctx, newOrder));
        this.drawOrders();
    }

    getNewOrderX(index) {
        return index * 25 + 50;
    }

    drawTable() {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.beginPath();
        ctx.rect(this.coordinate.x, this.coordinate.y, this.width, this.height);
        ctx.fillStyle = '#3d2b05';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }

    drawOrders() {
        this.orders.forEach(x => x.draw());
    }
}

class Order {
    constructor(ctx, coordinate) {
        this.ctx = ctx;
        this.coordinate = coordinate;
        this.isClaimed = false;
    }

    draw() {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.beginPath();
        ctx.rect(this.coordinate.x, this.coordinate.y, 20, 20);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
}

class Grill {
    constructor(ctx, coordinate, index) {
        this.ctx = ctx;
        this.coordinate = coordinate;
        this.litFrames = 0;
        this.hasDish = false;
        this.isClaimed = false;
        this.width = 40;
        this.height = 30;
        this.cookDuration = 500;
        this.index = index;
    }

    draw() {
        this.drawGrill();
        if (this.litFrames > 0) {
            this.litFrames--;
        }
    }

    cook() {
        this.hasDish = true;
        this.litFrames = this.cookDuration;
    }

    takeDish() {
        this.hasDish = false;
    }

    isOn() {
        return this.litFrames > 0;
    }

    drawGrill() {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.beginPath();
        ctx.rect(this.coordinate.x, this.coordinate.y, this.width, this.height);
        ctx.fillStyle = this.isOn() ? 'red' : 'black';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        if (this.hasDish) {
            this.drawDish();
        }
    }

    drawDish() {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(this.coordinate.x + this.width/2, this.coordinate.y + this.height/2, 6, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = this.isOn() ? 'pink' : '#3d2b05';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
}

class Store {
    constructor(ctx) {
        this.ctx = ctx;
        this.coordinate = new Coordinate(50, 400);
        this.width = 900;
        this.height = 150;
        this.money = 40;
        this.totalMoney = 30;
        this.grillPrice = 15;
        this.chefPrice = 30;
        this.superChefPrice = 50;
        this.updateStore();
    }

    addSale() {
        var price = 5;
        this.money += price;
        this.totalMoney += price;
        this.updateStore();
    }

    buyItem(price) {
        this.money -= price;
        this.updateStore();
    }

    updateStore() {
        document.getElementById("cash-amount").innerText = this.money;
        this.updateButtons();
    }

    updateButtons() {
        var button = document.getElementById("buy-grill");
        if (this.money >= this.grillPrice) {
            enableButton(button);
        } else {
            disableButton(button);
        }
        
        var button = document.getElementById("buy-chef");
        if (this.money >= this.chefPrice) {
            enableButton(button);
        } else {
            disableButton(button);
        }

        var button = document.getElementById("buy-super-chef");
        if (this.money >= this.superChefPrice) {
            enableButton(button);
        } else {
            disableButton(button);
        }

        function enableButton(button) {
            button.classList.remove('disabled');
            button.disabled = false;
        }
        function disableButton(button) {
            button.classList.add('disabled');
            button.disabled = true;
        }
    }
}

class Kitchen {
    constructor(ctx) {
        this.ctx = ctx;
        this.orders = new Orders(ctx, new Coordinate(50, 300));
        this.grills = [ new Grill(this.ctx, new Coordinate(50, 20), 0) ];
        this.store = new Store(ctx);
        this.staff = new Staff(ctx, this);
    }

    addGrill() {
        var grillCount = this.grills.length;
        var newGrill = new Grill(this.ctx, new Coordinate(grillCount*60+45, 20), grillCount);
        this.grills.push(newGrill);
        this.store.buyItem(this.store.grillPrice);
    }

    draw() {
        this.orders.draw();
        this.grills.forEach(x => x.draw());
        this.staff.draw();
    }
    
    getGrillWithCookedDish() {
        return this.grills.find(x => x.isOn() == false && x.hasDish && x.isClaimed == false);
    }

    grillIsAvailable() {
        var asdf = this.grills.some(x => x.hasDish == false && x.isClaimed == false);
        return asdf;
    }

    getUnclaimedOrder() {
        return this.orders.orders.find(x => x.isClaimed == false);
    }

    getUnclaimedGrill() {
        return this.grills.find(x => x.isOn() == false && x.hasDish == false && x.isClaimed == false);
    }
}

class Staff {
    constructor(ctx, kitchen) {
        this.ctx = ctx;
        this.kitchen = kitchen;
        this.chefs = [];
    }

    addChef() {
        this.chefs.push(new Chef(this.ctx, new Coordinate(50, 200), this.kitchen));
    }

    addSuperChef() {
        this.chefs.push(new SuperChef(this.ctx, new Coordinate(20, 200), this.kitchen));
    }

    draw() {
        this.chefs.forEach(x => x.draw());
    }

    superChefCount() {
        return this.chefs.filter(x => x.constructor.name == "SuperChef").length;
    }
}