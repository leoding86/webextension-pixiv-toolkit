class Action {
  constructor() {
    this.actions = { }
  }

  has(actionName) {
    return this.actions[actionName + 'Action']
  }

  callAction(actionName, args) {
    let action = this.actions[actionName + 'Action']

    let caller = action.handle

    caller.call(action, args)
  }
}

export default new Action()
