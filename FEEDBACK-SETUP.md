# 💬 Feedback Feature Setup Guide

## Overview
A beautiful feedback system with a floating button on Landing and Dashboard pages that sends messages directly to your Telegram bot.

## Features
✅ Floating feedback button (bottom-right corner)
✅ Beautiful modal with name and feedback fields
✅ Sends formatted messages to Telegram
✅ Success animation and auto-close
✅ Works on both Landing and Dashboard pages
✅ Cyberpunk-themed design with neon accents

---

## Setup Steps

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow instructions:
   - Choose a name (e.g., "Digitel Feedback Bot")
   - Choose a username (e.g., "digitel_feedback_bot")
4. **Copy the bot token** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Chat ID

**Option A: Using @userinfobot**
1. Search for **@userinfobot** on Telegram
2. Start a chat and send any message
3. Copy your **Chat ID** (a number like: `123456789`)

**Option B: Using @RawDataBot**
1. Search for **@RawDataBot** on Telegram
2. Send any message
3. Look for `"id":` in the response
4. Copy that number

**For a Group/Channel:**
1. Add your bot to the group/channel
2. Make the bot an admin (if it's a channel)
3. Send a message in the group
4. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. Look for `"chat":{"id":` (will be negative for groups like: `-1001234567890`)

### 3. Configure Your .env File

Open your `.env` file and update:

```env
# Telegram Bot Configuration (for feedback)
VITE_TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
VITE_TELEGRAM_CHAT_ID=123456789
```

Replace with your actual bot token and chat ID.

### 4. Restart Your Dev Server

```bash
npm run dev
```

---

## Testing

1. Open your app (Landing or Dashboard page)
2. Look for the **floating feedback button** (bottom-right corner)
3. Click it to open the modal
4. Fill in your name (optional) and feedback
5. Click "Send Feedback"
6. Check your Telegram - you should receive a message!

---

## Message Format

The Telegram message will look like:

```
🎯 New Feedback from Digitel

👤 Name: John Doe

💬 Feedback:
This is awesome! Love the cyberpunk theme.

⏰ 12/10/2025, 10:30:45 AM
```

---

## Customization

### Change Button Position

Edit `src/components/FeedbackButton.jsx`:

```jsx
// Current: bottom-6 right-6
className="fixed bottom-6 right-6 ..."

// Options:
// Bottom-left: "fixed bottom-6 left-6 ..."
// Top-right: "fixed top-20 right-6 ..."
```

### Change Button Style

The button uses:
- Neon green background (`bg-neon-500`)
- Pulse animation (`animate-pulse`)
- Glow shadow on hover

### Customize Message Format

Edit `src/components/FeedbackModal.jsx`, line ~40:

```javascript
const message = `🎯 *New Feedback from Digitel*\n\n👤 *Name:* ${formData.name || 'Anonymous'}\n\n💬 *Feedback:*\n${formData.feedback}\n\n⏰ ${new Date().toLocaleString()}`;
```

Add more fields, emojis, or formatting as needed.

---

## Files Created

1. **`src/components/FeedbackModal.jsx`** - The feedback form modal
2. **`src/components/FeedbackButton.jsx`** - Floating button component
3. Updated **`src/pages/Landing.jsx`** - Added feedback button
4. Updated **`src/pages/Dashboard.jsx`** - Added feedback button
5. Updated **`.env`** - Added Telegram config

---

## Troubleshooting

### "Telegram configuration missing"
- Make sure `.env` has `VITE_TELEGRAM_BOT_TOKEN` and `VITE_TELEGRAM_CHAT_ID`
- Restart dev server after changing `.env`

### "Failed to send feedback"
- Check bot token is correct
- Check chat ID is correct
- Make sure you've sent at least one message to your bot
- For groups: make sure bot is a member and has permission to post

### Bot not receiving messages
- Start a conversation with your bot first (send `/start`)
- For groups: add bot as admin
- Check bot token in @BotFather

### Button not showing
- Check console for errors
- Verify imports in Landing.jsx and Dashboard.jsx
- Clear browser cache

---

## Security Notes

⚠️ **Important**: 
- Bot tokens in `.env` are visible in the browser (frontend)
- Anyone can inspect and see your bot token
- For production, consider moving this to your **backend API**

**Recommended Production Setup:**
1. Create endpoint in `server-api/server.js`:
   ```javascript
   app.post('/feedback', async (req, res) => {
     // Send to Telegram from server
   });
   ```
2. Keep bot token in server `.env` (not in frontend)
3. Frontend calls your API instead of Telegram directly

This keeps your bot token secure! 🔒

---

## Next Steps

1. ✅ Set up Telegram bot
2. ✅ Configure .env with credentials
3. ✅ Test the feedback system
4. 🔄 (Optional) Move to backend API for security
5. 🎉 Collect awesome feedback from users!

Enjoy your new feedback system! 💚
