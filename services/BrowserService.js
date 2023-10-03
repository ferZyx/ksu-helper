import BrowserController from "../controllers/BrowserController.js";

class BrowserService {
    async restartBrowser(){
        try{
            await BrowserController.browser?.close()
            await BrowserController.launchBrowser()
        }catch (e) {
            throw e
        }
    }
}

export default new BrowserService()