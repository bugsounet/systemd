const exec = require("shelljs").exec

const detailsRegex = /Id=(.+)\nActiveState=(.+)\nSubState=(.+)\nUnitFileState=(.+)\nStateChangeTimestamp=(.+)?/m

class Systemd {
  constructor(service) {
    this.service = service
    this.init= false
    this.checkService()
  }

  status() {
    if (!this.init) return { error: "not initialized" }
    const command = [
      `systemctl show ${this.service}`,
      'Id',
      'ActiveState',
      'SubState',
      'UnitFileState',
      'StateChangeTimestamp'
    ].join(' -p ')
  
    const currentStatus = exec(command, { silent: true })
      .trim()
      .split('\n\n')
      .map((serviceData) => {
        const properties = serviceData.match(detailsRegex)
        if (!properties) return {
          name: this.service, 
          error: "Unknown service"
        }
        let [, name, activeState, state, unitFileState] = properties
        name = sliceLast(name, '.')
        return {
          name,
          state,
          isActive: activeState === 'active',
          isDisabled: unitFileState === 'disabled'
        }
      })
    return currentStatus[0]
  }
  
  restart() {
    if (!this.init) return { error: "not initialized" }
    const command = `sudo systemctl restart ${this.service}`
  
    const currentRestart = exec(command, { silent: true })
    if (currentRestart.stderr) {
      let error = sliceLast(currentRestart.stderr, "\n")
      return {
        name: this.service,
        error: error
      }
    }
    else return {
      name: this.service,
      restart: "ok"
    }
  }

  checkService() {
    if (typeof this.service === 'string') this.init = true
    else throw new Error ("service name missing")
  }
}

function sliceLast(str, sep = ' ') {
  const splitedStr = str.split(sep)
  return splitedStr.length > 1
    ? splitedStr.slice(0, -1).join(sep)
    : str
}

module.exports = Systemd
