import Event from "@/modules/Event";

class AbstractService extends Event {
  application;

  setApplication(application) {
    this.application = application;
  }
}

export default AbstractService;
