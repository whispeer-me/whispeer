// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Chat from "@/pages/chat/index.vue";
import useChat from "@/composables/chat/ui";
import type { ChatMessage } from "~/types/chat.message";

describe("Chat Component", () => {
  vi.mock("@/composables/chat/ui", () => {
    const message = ref("");
    const messages = ref<ChatMessage[]>([]);
    return {
      default: vi.fn(() => ({
        message,
        messages,
        sendMessage: vi.fn(async () => {
          const chatMessage: ChatMessage = {
            id: new Date().getTime(),
            content: message.value,
          };

          await new Promise(resolve => setTimeout(resolve, 100));

          messages.value.push(chatMessage);
        }),
        checkScrollPosition: vi.fn(),
        scrollToBottom: vi.fn(),
        showNewMessageNotification: ref(false),
        messagesContainer: ref(null),
        getMessageClass: vi.fn(),
        maxCharsAllowed: 500,
      })),
    };
  });

  it("renders without crashing", () => {
    const wrapper = mount(Chat);
    expect(wrapper.exists()).toBe(true);
  });

  it("sends a message and updates the messages list", async () => {
    const wrapper = mount(Chat);

    const messageInput = wrapper.find("input[type=\"text\"]");
    await messageInput.setValue("Hello, World!");
    const sendButton = wrapper.find("button[type=\"submit\"]");
    await sendButton.trigger("click");

    await nextTick();

    const { messages } = useChat();

    expect(messages.value).toHaveLength(1);
    expect(messages.value[0].content).toBe("Hello, World!");
  });
});
