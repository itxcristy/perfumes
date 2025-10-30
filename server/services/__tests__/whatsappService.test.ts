import { whatsAppService } from '../whatsappService';

describe('WhatsApp Service', () => {
  it('should be defined', () => {
    expect(whatsAppService).toBeDefined();
  });

  it('should have sendOrderNotification method', () => {
    expect(whatsAppService.sendOrderNotification).toBeDefined();
  });
});