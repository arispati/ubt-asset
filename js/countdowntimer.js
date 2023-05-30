function CountDownTimer(duration, granularity) {
  this.duration = duration;
  this.granularity = granularity || 1000;
  this.tickFtns = [];
  this.running = false;
}

CountDownTimer.prototype.start = function() {
  if (this.running) {
    return;
  }
  this.running = true;
  var start = Date.now(),
      that = this,
      diff;

  (function timer() {
    diff = that.duration - (((Date.now() - start) / 1000) | 0);

    if (diff > 0) {
      setTimeout(timer, that.granularity);
    } else {
      diff = 0;
      that.running = false;
    }

    that.tickFtns.forEach(function(ftn) {
      ftn.call(this, CountDownTimer.parse(diff));
    }, that);
  }());
};

CountDownTimer.prototype.onTick = function(ftn) {
  if (typeof ftn === 'function') {
    this.tickFtns.push(ftn);
  }
  return this;
};

CountDownTimer.prototype.expired = function() {
  return !this.running;
};

CountDownTimer.parse = function(current) {
  let hours = (current / 3600) | 0
  let minutes = ((current % 3600) / 60) | 0;
  let seconds = (current % 60) | 0

  return {
    'hours': hours < 10 ? "0" + hours : hours,
    'minutes': minutes < 10 ? "0" + minutes : minutes,
    'seconds': seconds < 10 ? "0" + seconds : seconds
  };
};