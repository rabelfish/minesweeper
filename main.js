var minesweeper = new Vue({
  el: "#minesweeper",
  data: {
    board_size: 20,
    new_board_size: 20, // change board size to this, mapped to the input
    non_mines: 0, // the number of boxes the user needs to reveal to win
    mines_left: 0, // the mine counter (actually is the flag counter)
    mine_map: [],
    revealed_map: [],
    show_mines: 0,
    face: "smile",
    timer: null,
    interval: null,
    difficulties: {
      easy: 6,
      medium: 5,
      hard: 4,
      master: 3
    },
    difficulty: "easy",
    new_difficulty: "easy"
  },
  computed: {
    formatted_timer() {
      let minutes = Math.floor(this.timer/60);
      let seconds = this.timer - minutes*60;
      if (minutes < 10) minutes = "0" + minutes;
      if (seconds < 10) seconds = "0" + seconds;
      return minutes + ":" + seconds;
    }
  },
  methods: {
    display_box: function(x, y) {
      if (this.interval === null) {
        this.startTimer();
      }

      // no clicking if we have won or lost
      if (!this.show_mines) {
        let index = x * this.board_size + y;

        // if we get off the board or click an already revealed box or a flag
        if (this.mine_map[index] == undefined || this.revealed_map[index] != 0) {
          return;
        }

        // if we find a mine, put game into losing state
        if (this.mine_map[index] == -1) {
          clearInterval(this.interval);
          this.interval = null;
          document.getElementById("ind_" + x + "_" + y).style.color = "red";
          this.show_mines = 1;
          this.face = "frown";
        } else {
          // if it is not a mine, change the color and mark it as revealed
          document.getElementById("ind_" + x + "_" + y).style["background-color"] = "#f0f0f0";
          let map = this.revealed_map.slice(0);
          map[index] = 1;
          this.revealed_map = map;

          // decrease the amount of non_mine boxes that the player has revealed. If it is all of them, the player won!
          this.non_mines = this.non_mines - 1;
          if (this.non_mines == 0) {
            clearInterval(this.interval);
            this.interval = null;
            this.show_mines = 1;
            this.face = "grin";
          }

          // if the box clicked was a zero, reveal it's neighbors
          if (this.mine_map[index] == 0) {
            // the top and bottom neighbors
            this.display_box(x - 1, y);
            this.display_box(x + 1, y);

            // the right neighbors if it is not a right edge
            if (y + 1 < this.board_size) {
              this.display_box(x, y + 1);
              this.display_box(x - 1, y + 1);
              this.display_box(x + 1, y + 1);
            }

            // the left neighbors if it is not a left edge
            if (y - 1 >= 0) {
              this.display_box(x, y - 1);
              this.display_box(x + 1, y - 1);
              this.display_box(x - 1, y - 1);
            }
          }
        }
      }
    },
    display_flag: function(x, y) {
      if (this.show_mines) {
        return;
      }

      if (this.interval === null) {
        this.startTimer();
      }

      // make a copy of the revealed map since we are going to update it
      let map = this.revealed_map.slice(0);
      let index = x * this.board_size + y;

      // if there is a flag, remove the flag
      if (this.revealed_map[index] == -1) {
        map[index] = 0;
        this.revealed_map = map;

        this.mines_left = this.mines_left + 1;
        // if there is not a flag, add a flag
      } else if (this.revealed_map[index] == 0) {
        map[index] = -1;
        this.revealed_map = map;

        this.mines_left = this.mines_left - 1;
      }
    },
    touchingMines: function(x, y) {
      // if there is a bomb here return bomb
      if (this.mine_map[x * this.board_size + y] == -1) {
        return -1;
      }

      // check all neighbors and add up the number of bombs
      // top and bottom
      let count =
        (this.mine_map[(x - 1) * this.board_size + y] === -1 ? 1 : 0) +
        (this.mine_map[(x + 1) * this.board_size + y] === -1 ? 1 : 0);

      // the three on the right if it is not on the right edge
      if (y + 1 < this.board_size) {
        count =
          count +
          (this.mine_map[x * this.board_size + (y + 1)] === -1 ? 1 : 0) +
          (this.mine_map[(x - 1) * this.board_size + (y + 1)] === -1 ? 1 : 0) +
          (this.mine_map[(x + 1) * this.board_size + (y + 1)] === -1 ? 1 : 0);
      }
      // the three on the left if it is not on the left edge
      if (y - 1 >= 0) {
        count =
          count +
          (this.mine_map[(x - 1) * this.board_size + (y - 1)] === -1 ? 1 : 0) +
          (this.mine_map[x * this.board_size + (y - 1)] === -1 ? 1 : 0) +
          (this.mine_map[(x + 1) * this.board_size + (y - 1)] === -1 ? 1 : 0);
      }

      return count;
    },
    startTimer() {
      clearInterval(this.interval);
      this.interval = setInterval(
        function() {
          this.timer = this.timer + 1;
        }.bind(this),
        1000
      );
    },
    save_settings() {
      this.board_size = parseInt(this.new_board_size);
      this.difficulty = this.new_difficulty;

      this.reset();
    },
    reset() {
      // clear everything out
      this.show_mines = 0;
      this.face = "smile";
      this.timer = 0;
      clearInterval(this.interval);
      this.interval = null;

      let els = document.getElementsByClassName("box");

      for (let e = 0; e < els.length; e++) {
        els[e].style.color = "black";
        els[e].style["background-color"] = "silver";
      }

      // re-initialize the board
      this.initBoard();
    },
    initBoard() {
      this.show_mines = 0;
      this.face = "smile";
      this.timer = 0;
      this.interval = null;

      // number of boxes
      let boxes = this.board_size * this.board_size;

      // set the header size to 25 * the board size because each block is 25 px
      document.getElementById("header").style.width = this.board_size * 25 + 3 + "px";

      // creates an array of numbers from 0 to the number of boxes
      let nums = Array.apply(null, { length: boxes }).map(Number.call, Number);

      let ranNums = [];

      // the number of mines
      let mines = Math.floor(boxes / this.difficulties[this.difficulty]);
      this.mines_left = mines;
      this.non_mines = boxes - mines;

      // select random numbers from nums. as many numbers as we need bombs
      let j;
      while (mines > 0) {
        // generate a random number from 0 to nums.length-1
        j = Math.floor(Math.random() * (nums.length - 1));
        // select the number in nums at that index and remove it from nums so we don't get duplicates
        ranNums.push(nums[j]);
        nums.splice(j, 1);
        mines--;
      }

      // initialize mine_map and revealed_map to all zeros the size of the board
      this.revealed_map = Array.apply(null, Array(boxes)).map(Number.prototype.valueOf, 0);
      this.mine_map = Array.apply(null, Array(boxes)).map(Number.prototype.valueOf, 0);

      // place the mines in the map
      let k = 0;
      while (k < ranNums.length) {
        this.mine_map[ranNums[k]] = -1;
        k++;
      }

      // calculate how many mines are touching each box
      for (let x = 0; x < this.board_size; x++) {
        for (let y = 0; y < this.board_size; y++) {
          this.mine_map[x * this.board_size + y] = this.touchingMines(x, y);
        }
      }
    }
  },
  created() {
    this.initBoard();
  }
});
