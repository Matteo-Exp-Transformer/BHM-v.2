# Email Templates - Login Hardening System

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Versione**: 1.0

## Overview

Template email per sistema di inviti e password recovery. Include variabili dinamiche, TTL token configurabili e regole di invalidazione. Supporta HTML e testo semplice per massima compatibilità.

---

## Template Configuration

### Base Template Structure
```typescript
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
  ttl: number;              // Time to live in minutes
  maxAttempts: number;      // Maximum attempts before invalidation
  securityLevel: 'low' | 'medium' | 'high';
}

interface EmailContext {
  recipientEmail: string;
  recipientName?: string;
  senderName: string;
  senderEmail: string;
  tenantName: string;
  baseUrl: string;
  supportEmail: string;
  expiresAt: Date;
  variables: Record<string, any>;
}
```

---

## Invitation Email Template

### Template Definition
```typescript
const INVITATION_TEMPLATE: EmailTemplate = {
  id: 'user_invitation',
  name: 'User Invitation',
  subject: '{{tenantName}} - Invito a partecipare',
  ttl: 1440,              // 24 hours
  maxAttempts: 3,
  securityLevel: 'high',
  
  variables: [
    'recipientName',
    'tenantName',
    'roleName',
    'inviteUrl',
    'expiresAt',
    'invitedBy',
    'supportEmail'
  ],
  
  htmlBody: `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invito a partecipare</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f8fafc; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{tenantName}}</h1>
        </div>
        
        <div class="content">
            <h2>Ciao {{recipientName}}!</h2>
            
            <p>Sei stato invitato da <strong>{{invitedBy}}</strong> a partecipare a <strong>{{tenantName}}</strong> come <strong>{{roleName}}</strong>.</p>
            
            <p>Per completare la registrazione e accedere alla piattaforma, clicca sul pulsante qui sotto:</p>
            
            <div style="text-align: center;">
                <a href="{{inviteUrl}}" class="button">Accetta Invito</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                    <li>Questo invito scade il <strong>{{expiresAt}}</strong></li>
                    <li>Il link può essere utilizzato una sola volta</li>
                    <li>Non condividere questo link con altre persone</li>
                </ul>
            </div>
            
            <p>Se non riesci a cliccare sul pulsante, copia e incolla questo link nel tuo browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">{{inviteUrl}}</p>
            
            <p>Se non hai richiesto questo invito o hai domande, contatta il supporto tecnico all'indirizzo <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
        </div>
        
        <div class="footer">
            <p>© 2025 {{tenantName}}. Tutti i diritti riservati.</p>
            <p>Questo messaggio è stato inviato automaticamente, non rispondere a questa email.</p>
        </div>
    </div>
</body>
</html>`,
  
  textBody: `
{{tenantName}} - Invito a partecipare

Ciao {{recipientName}}!

Sei stato invitato da {{invitedBy}} a partecipare a {{tenantName}} come {{roleName}}.

Per completare la registrazione e accedere alla piattaforma, visita questo link:
{{inviteUrl}}

IMPORTANTE:
- Questo invito scade il {{expiresAt}}
- Il link può essere utilizzato una sola volta
- Non condividere questo link con altre persone

Se non hai richiesto questo invito o hai domande, contatta il supporto tecnico all'indirizzo {{supportEmail}}.

---
© 2025 {{tenantName}}. Tutti i diritti riservati.
Questo messaggio è stato inviato automaticamente, non rispondere a questa email.`
};
```

---

## Password Recovery Email Template

### Template Definition
```typescript
const RECOVERY_TEMPLATE: EmailTemplate = {
  id: 'password_recovery',
  name: 'Password Recovery',
  subject: '{{tenantName}} - Recupero Password',
  ttl: 15,               // 15 minutes
  maxAttempts: 1,        // One-time use only
  securityLevel: 'high',
  
  variables: [
    'recipientName',
    'tenantName',
    'recoveryUrl',
    'expiresAt',
    'ipAddress',
    'userAgent',
    'supportEmail'
  ],
  
  htmlBody: `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recupero Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f8fafc; }
        .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .security-notice { background: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .info-box { background: #eff6ff; border: 1px solid #93c5fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{tenantName}}</h1>
            <h2>Recupero Password</h2>
        </div>
        
        <div class="content">
            <h2>Ciao {{recipientName}}!</h2>
            
            <p>Abbiamo ricevuto una richiesta per reimpostare la password del tuo account su <strong>{{tenantName}}</strong>.</p>
            
            <div style="text-align: center;">
                <a href="{{recoveryUrl}}" class="button">Reimposta Password</a>
            </div>
            
            <div class="security-notice">
                <strong>🔒 Avviso di Sicurezza:</strong>
                <ul>
                    <li>Questo link scade il <strong>{{expiresAt}}</strong></li>
                    <li>Può essere utilizzato una sola volta</li>
                    <li>Se non hai richiesto questo reset, ignora questa email</li>
                </ul>
            </div>
            
            <div class="info-box">
                <strong>📋 Dettagli della richiesta:</strong>
                <ul>
                    <li>Data e ora: {{requestTime}}</li>
                    <li>Indirizzo IP: {{ipAddress}}</li>
                    <li>Browser: {{userAgent}}</li>
                </ul>
            </div>
            
            <p>Se non riesci a cliccare sul pulsante, copia e incolla questo link nel tuo browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">{{recoveryUrl}}</p>
            
            <p><strong>Non hai richiesto questo reset?</strong><br>
            Se non hai fatto richiesta di reset password, contatta immediatamente il supporto tecnico all'indirizzo <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
        </div>
        
        <div class="footer">
            <p>© 2025 {{tenantName}}. Tutti i diritti riservati.</p>
            <p>Questo messaggio è stato inviato automaticamente, non rispondere a questa email.</p>
            <p>Per motivi di sicurezza, non memorizziamo la tua password in chiaro.</p>
        </div>
    </div>
</body>
</html>`,
  
  textBody: `
{{tenantName}} - Recupero Password

Ciao {{recipientName}}!

Abbiamo ricevuto una richiesta per reimpostare la password del tuo account su {{tenantName}}.

Per reimpostare la tua password, visita questo link:
{{recoveryUrl}}

🔒 AVVISO DI SICUREZZA:
- Questo link scade il {{expiresAt}}
- Può essere utilizzato una sola volta
- Se non hai richiesto questo reset, ignora questa email

📋 Dettagli della richiesta:
- Data e ora: {{requestTime}}
- Indirizzo IP: {{ipAddress}}
- Browser: {{userAgent}}

NON HAI RICHIESTO QUESTO RESET?
Se non hai fatto richiesta di reset password, contatta immediatamente il supporto tecnico all'indirizzo {{supportEmail}}.

---
© 2025 {{tenantName}}. Tutti i diritti riservati.
Questo messaggio è stato inviato automaticamente, non rispondere a questa email.
Per motivi di sicurezza, non memorizziamo la tua password in chiaro.`
};
```

---

## Email Service Implementation

### Email Service Class
```typescript
class EmailService {
  private templates: Map<string, EmailTemplate> = new Map();
  private smtpConfig: SMTPConfig;
  
  constructor(smtpConfig: SMTPConfig) {
    this.smtpConfig = smtpConfig;
    this.loadTemplates();
  }
  
  private loadTemplates(): void {
    this.templates.set('user_invitation', INVITATION_TEMPLATE);
    this.templates.set('password_recovery', RECOVERY_TEMPLATE);
  }
  
  async sendInvitationEmail(context: InvitationContext): Promise<void> {
    const template = this.templates.get('user_invitation');
    if (!template) {
      throw new Error('Invitation template not found');
    }
    
    const emailContext: EmailContext = {
      recipientEmail: context.email,
      recipientName: context.name || context.email.split('@')[0],
      senderName: context.invitedBy,
      senderEmail: this.smtpConfig.from,
      tenantName: context.tenantName,
      baseUrl: process.env.BASE_URL,
      supportEmail: process.env.SUPPORT_EMAIL,
      expiresAt: context.expiresAt,
      variables: {
        recipientName: context.name || context.email.split('@')[0],
        tenantName: context.tenantName,
        roleName: context.roleName,
        inviteUrl: context.inviteUrl,
        expiresAt: context.expiresAt.toLocaleString('it-IT'),
        invitedBy: context.invitedBy,
        supportEmail: process.env.SUPPORT_EMAIL
      }
    };
    
    await this.sendEmail(template, emailContext);
    
    // Log email sent
    await this.logEmailEvent('invitation_sent', {
      email: context.email,
      tenantId: context.tenantId,
      expiresAt: context.expiresAt
    });
  }
  
  async sendRecoveryEmail(context: RecoveryContext): Promise<void> {
    const template = this.templates.get('password_recovery');
    if (!template) {
      throw new Error('Recovery template not found');
    }
    
    const emailContext: EmailContext = {
      recipientEmail: context.email,
      recipientName: context.name || context.email.split('@')[0],
      senderName: this.smtpConfig.fromName,
      senderEmail: this.smtpConfig.from,
      tenantName: context.tenantName,
      baseUrl: process.env.BASE_URL,
      supportEmail: process.env.SUPPORT_EMAIL,
      expiresAt: context.expiresAt,
      variables: {
        recipientName: context.name || context.email.split('@')[0],
        tenantName: context.tenantName,
        recoveryUrl: context.recoveryUrl,
        expiresAt: context.expiresAt.toLocaleString('TABLE'),
        requestTime: context.requestTime.toLocaleString('it-IT'),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        supportEmail: process.env.SUPPORT_EMAIL
      }
    };
    
    await this.sendEmail(template, emailContext);
    
    // Log email sent
    await this.logEmailEvent('recovery_sent', {
      email: context.email,
      expiresAt: context.expiresAt,
      ipAddress: context.ipAddress
    });
  }
  
  private async sendEmail(
    template: EmailTemplate,
    context: EmailContext
  ): Promise<void> {
    
    // Render template with variables
    const subject = this.renderTemplate(template.subject, context.variables);
    const htmlBody = this.renderTemplate(template.htmlBody, context.variables);
    const textBody = this.renderTemplate(template.textBody, context.variables);
    
    // Prepare email
    const emailData = {
      to: context.recipientEmail,
      from: `${context.senderName} <${context.senderEmail}>`,
      subject,
      html: htmlBody,
      text: textBody,
      headers: {
        'X-Template-ID': template.id,
        'X-TTL': template.ttl.toString(),
        'X-Security-Level': template.securityLevel
      }
    };
    
    // Send via SMTP
    await this.smtpTransport.sendMail(emailData);
  }
  
  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(placeholder, String(value || ''));
    }
    
    return rendered;
  }
  
  private async logEmailEvent(
    event: string,
    data: Record<string, any>
  ): Promise<void> {
    
    await this.auditLogger.log({
      action: event,
      outcome: 'success',
      metadata: {
        ...data,
        timestamp: new Date()
      }
    });
  }
}
```

---

## Token Management

### Token Generation and Validation
```typescript
class TokenManager {
  async generateInviteToken(
    email: string,
    roleId: string,
    tenantId: string,
    expiresInHours: number = 24
  ): Promise<InviteToken> {
    
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Hash token for storage
    const tokenHash = await bcrypt.hash(token, 12);
    
    // Calculate expiration
    const expiresAt = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));
    
    // Store in database
    const inviteRecord = await this.db.invites.create({
      email,
      role_id: roleId,
      tenant_id: tenantId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      status: 'pending'
    });
    
    return {
      id: inviteRecord.id,
      token,
      expiresAt,
      email,
      roleId,
      tenantId
    };
  }
  
  async generateRecoveryToken(
    userId: string,
    expiresInMinutes: number = 15
  ): Promise<RecoveryToken> {
    
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Hash token for storage
    const tokenHash = await bcrypt.hash(token, 12);
    
    // Calculate expiration
    const expiresAt = new Date(Date.now() + (expiresInMinutes * 60 * 1000));
    
    // Store in user recovery_tokens array
    await this.db.users.update({
      id: userId,
      recovery_tokens: this.db.raw(`
        array_append(
          array_remove(recovery_tokens, '${tokenHash}'),
          '${tokenHash}'
        )
      `)
    });
    
    return {
      token,
      expiresAt,
      userId
    };
  }
  
  async validateInviteToken(token: string): Promise<InviteTokenValidation> {
    const tokenHash = await this.hashToken(token);
    
    const invite = await this.db.invites.findOne({
      token_hash: tokenHash,
      status: 'pending',
      expires_at: { $gt: new Date() }
    });
    
    if (!invite) {
      return {
        valid: false,
        reason: 'TOKEN_NOT_FOUND_OR_EXPIRED'
      };
    }
    
    if (invite.attempts >= invite.max_attempts) {
      return {
        valid: false,
        reason: 'MAX_ATTEMPTS_EXCEEDED'
      };
    }
    
    return {
      valid: true,
      invite: {
        id: invite.id,
        email: invite.email,
        roleId: invite.role_id,
        tenantId: invite.tenant_id,
        expiresAt: invite.expires_at
      }
    };
  }
  
  async validateRecoveryToken(token: string): Promise<RecoveryTokenValidation> {
    const tokenHash = await this.hashToken(token);
    
    const user = await this.db.users.findOne({
      recovery_tokens: { $contains: [tokenHash] }
    });
    
    if (!user) {
      return {
        valid: false,
        reason: 'TOKEN_NOT_FOUND'
      };
    }
    
    // Check if token is expired (stored in user metadata)
    const tokenData = user.recovery_tokens.find(t => t.hash === tokenHash);
    if (!tokenData || tokenData.expires_at < new Date()) {
      return {
        valid: false,
        reason: 'TOKEN_EXPIRED'
      };
    }
    
    return {
      valid: true,
      userId: user.id,
      email: user.email
    };
  }
  
  async invalidateToken(token: string, type: 'invite' | 'recovery'): Promise<void> {
    const tokenHash = await this.hashToken(token);
    
    if (type === 'invite') {
      await this.db.invites.update({
        token_hash: tokenHash
      }, {
        status: 'used',
        token_used_at: new Date()
      });
    } else {
      await this.db.users.update({
        recovery_tokens: { $contains: [tokenHash] }
      }, {
        recovery_tokens: { $remove: [tokenHash] }
      });
    }
  }
  
  private async hashToken(token: string): Promise<string> {
    return await bcrypt.hash(token, 12);
  }
}
```

---

## Configuration

### Environment Variables
```bash
# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@example.com
SMTP_FROM_NAME="Business HACCP Manager"

# Email Templates
EMAIL_BASE_URL=https://yourdomain.com
EMAIL_SUPPORT_EMAIL=support@example.com
EMAIL_INVITE_TTL_HOURS=24
EMAIL_RECOVERY_TTL_MINUTES=15

# Security
EMAIL_TOKEN_SECRET=your-token-secret
EMAIL_RATE_LIMIT_PER_HOUR=10
EMAIL_MAX_ATTEMPTS_INVITE=3
EMAIL_MAX_ATTEMPTS_RECOVERY=1

# Monitoring
EMAIL_ENABLE_TRACKING=true
EMAIL_BOUNCE_HANDLING=true
EMAIL_COMPLAINT_HANDLING=true
```

### Template Variables Reference
```typescript
interface TemplateVariables {
  // Common variables
  recipientName: string;
  recipientEmail: string;
  tenantName: string;
  baseUrl: string;
  supportEmail: string;
  
  // Invitation specific
  roleName: string;
  inviteUrl: string;
  expiresAt: string;
  invitedBy: string;
  
  // Recovery specific
  recoveryUrl: string;
  requestTime: string;
  ipAddress: string;
  userAgent: string;
}
```

---

## Testing

### Unit Tests
```typescript
describe('EmailService', () => {
  test('should render invitation template correctly', async () => {
    const emailService = new EmailService(mockSMTPConfig);
    
    const context: InvitationContext = {
      email: 'user@example.com',
      name: 'John Doe',
      tenantName: 'Test Company',
      roleName: 'Admin',
      inviteUrl: 'https://example.com/invite/token123',
      expiresAt: new Date('2025-01-21T10:00:00Z'),
      invitedBy: 'Jane Admin',
      tenantId: 'tenant123'
    };
    
    const result = await emailService.sendInvitationEmail(context);
    expect(result).toBeDefined();
  });
  
  test('should render recovery template correctly', async () => {
    const emailService = new EmailService(mockSMTPConfig);
    
    const context: RecoveryContext = {
      email: 'user@example.com',
      name: 'John Doe',
      tenantName: 'Test Company',
      recoveryUrl: 'https://example.com/recovery/token123',
      expiresAt: new Date('2025-01-20T15:15:00Z'),
      requestTime: new Date('2025-01-20T15:00:00Z'),
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0...'
    };
    
    const result = await emailService.sendRecoveryEmail(context);
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Email Templates Integration', () => {
  test('should send invitation email with correct formatting', async () => {
    const mockSMTP = new MockSMTPTransport();
    const emailService = new EmailService(mockSMTP);
    
    await emailService.sendInvitationEmail(testInvitationContext);
    
    const sentEmail = mockSMTP.getLastSentEmail();
    expect(sentEmail.subject).toContain('Test Company');
    expect(sentEmail.html).toContain('Accetta Invito');
    expect(sentEmail.text).toContain('Accetta Invito');
  });
  
  test('should send recovery email with security warnings', async () => {
    const mockSMTP = new MockSMTPTransport();
    const emailService = new EmailService(mockSMTP);
    
    await emailService.sendRecoveryEmail(testRecoveryContext);
    
    const sentEmail = mockSMTP.getLastSentEmail();
    expect(sentEmail.subject).toContain('Recupero Password');
    expect(sentEmail.html).toContain('Avviso di Sicurezza');
    expect(sentEmail.text).toContain('AVVISO DI SICUREZZA');
  });
});
```
