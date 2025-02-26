import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API Key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const ASSISTANT_ID = "asst_EkNBYkyD3lMRzHlJPXIt7rHm";

    const { message, threadId } = await req.json() as { 
      message: string;
      threadId: string | null;
    };

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Créer ou réutiliser un thread
    let thread;
    try {
      if (threadId) {
        thread = await openai.beta.threads.retrieve(threadId);
      } else {
        thread = await openai.beta.threads.create();
      }
    } catch (error) {
      console.error('Error with thread:', error);
      return NextResponse.json(
        { error: 'Failed to create or retrieve thread' },
        { status: 500 }
      );
    }

    // Ajouter le message au thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
    });

    // Démarrer une exécution avec l'assistant
    const run = await openai.beta.threads.runs.create(
      thread.id,
      { assistant_id: ASSISTANT_ID }
    );

    // Attendre la réponse (avec timeout)
    const maxAttempts = 30;
    let attempts = 0;
    let runStatus;

    while (attempts < maxAttempts) {
      runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );

      if (runStatus.status === 'completed') {
        break;
      } else if (runStatus.status === 'failed' || runStatus.status === 'expired') {
        throw new Error(`Run ended with status: ${runStatus.status}`);
      }

      attempts += 1;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Récupérer les messages
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0];
    const messageContent = lastMessage.content[0];
    let responseText = "";
    
    if (messageContent.type === 'text') {
      responseText = messageContent.text.value;
    } else {
      responseText = "Received non-text response";
    }
    
    return NextResponse.json({ 
      response: responseText,
      threadId: thread.id
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}