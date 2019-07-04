export default {
  data () {
    return {
      inputPos: 0,
      renameFormat: ''
    }
  },

  methods: {
    setInputCursor: function(input, holder) {
      var self = this;
      var pos = this.inputPos + holder.length;

      setTimeout(function() {
        input.focus();
        input.setSelectionRange(pos, pos);
        self.inputPos = pos;
      });
    },

    updateInputPos: function(event) {
      this.inputPos = event.target.selectionStart;
    },

    updateFormat: function(holder) {
      this.renameFormat = this.renameFormat.slice(0, this.inputPos) + holder + this.renameFormat.slice(this.inputPos);
    }
  }
};