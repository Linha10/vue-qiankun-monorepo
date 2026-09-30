<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { ImageResize } from "tiptap-extension-resize-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { watch } from "vue";
import { ElMessageBox } from "element-plus";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    minHeight?: string;
  }>(),
  {
    modelValue: "",
    placeholder: "請輸入內容...",
    minHeight: "200px",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
}>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({ link: false, underline: false }),
    Underline,
    ImageResize.configure({ inline: false, allowBase64: false }),
    Link.configure({ openOnClick: false }),
    TextAlign.configure({
      types: ["heading", "paragraph", "image", "bulletList", "orderedList"],
    }),
  ],
  editorProps: {
    attributes: {
      class: "hc-rich-editor__content",
    },
  },
  onUpdate({ editor }) {
    emit("update:modelValue", editor.getHTML());
  },
});

// 同步外部 modelValue 變更（例如表單重置或初始化）
watch(
  () => props.modelValue,
  (val) => {
    if (!editor.value) return;
    const current = editor.value.getHTML();
    if (val !== current) {
      editor.value.commands.setContent(val || "");
    }
  },
);

// 插入圖片（URL）
async function insertImage() {
  try {
    const { value } = await ElMessageBox.prompt("請輸入圖片網址", "插入圖片", {
      confirmButtonText: "插入",
      cancelButtonText: "取消",
      inputPattern: /^https?:\/\/.+/,
      inputErrorMessage: "請輸入有效的 http/https 網址",
    });
    editor.value?.chain().focus().setImage({ src: value }).run();
  } catch {
    // 使用者取消，不處理
  }
}

// 插入連結
async function insertLink() {
  const previousUrl = editor.value?.getAttributes("link").href ?? "";
  try {
    const { value } = await ElMessageBox.prompt("請輸入連結網址", "插入連結", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      inputValue: previousUrl,
      inputPattern: /^https?:\/\/.+/,
      inputErrorMessage: "請輸入有效的 http/https 網址",
    });
    editor.value
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: value })
      .run();
  } catch {
    // 使用者取消
  }
}

function removeLink() {
  editor.value?.chain().focus().unsetLink().run();
}
</script>

<template>
  <div class="hc-rich-editor">
    <!-- 工具列 -->
    <div v-if="editor" class="hc-rich-editor__toolbar">
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('bold') }"
        title="粗體"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <i class="fa-solid fa-bold" />
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('italic') }"
        title="斜體"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <i class="fa-solid fa-italic" />
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('underline') }"
        title="底線"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <i class="fa-solid fa-underline" />
      </button>

      <span class="toolbar-divider" />

      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        title="標題 H2"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        title="標題 H3"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>

      <span class="toolbar-divider" />

      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        title="無序列表"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <i class="fa-solid fa-list-ul" />
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        title="有序列表"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <i class="fa-solid fa-list-ol" />
      </button>

      <span class="toolbar-divider" />

      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        title="引用"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        <i class="fa-solid fa-quote-left" />
      </button>
      <button
        type="button"
        class="toolbar-btn"
        title="分隔線"
        @click="editor.chain().focus().setHorizontalRule().run()"
      >
        <i class="fa-solid fa-minus" />
      </button>

      <span class="toolbar-divider" />

      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('link') }"
        title="插入連結"
        @click="editor.isActive('link') ? removeLink() : insertLink()"
      >
        <i class="fa-solid fa-link" />
      </button>
      <button
        type="button"
        class="toolbar-btn"
        title="插入圖片"
        @click="insertImage"
      >
        <i class="fa-solid fa-image" />
      </button>

      <span class="toolbar-divider" />

      <button
        type="button"
        class="toolbar-btn"
        :class="{
          'is-active':
            editor.isActive({ textAlign: 'left' }) ||
            (!editor.isActive({ textAlign: 'center' }) &&
              !editor.isActive({ textAlign: 'right' })),
        }"
        title="靠左對齊"
        @click="editor.chain().focus().setTextAlign('left').run()"
      >
        <i class="fa-solid fa-align-left" />
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
        title="置中對齊"
        @click="editor.chain().focus().setTextAlign('center').run()"
      >
        <i class="fa-solid fa-align-center" />
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
        title="靠右對齊"
        @click="editor.chain().focus().setTextAlign('right').run()"
      >
        <i class="fa-solid fa-align-right" />
      </button>

      <span class="toolbar-divider" />

      <button
        type="button"
        class="toolbar-btn"
        title="復原"
        :disabled="!editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
      >
        <i class="fa-solid fa-rotate-left" />
      </button>
      <button
        type="button"
        class="toolbar-btn"
        title="重做"
        :disabled="!editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
      >
        <i class="fa-solid fa-rotate-right" />
      </button>
    </div>

    <!-- 編輯區 -->
    <EditorContent
      :editor="editor"
      class="hc-rich-editor__body"
      :style="{ minHeight: minHeight }"
    />
  </div>
</template>

<style lang="scss">
@use "../styles/variables" as *;

.hc-rich-editor {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    border-bottom: 1px solid #dcdfe6;
    background: #f5f7fa;
  }

  &__body {
    padding: 0;
    cursor: text;

    .tiptap {
      outline: none;
      padding: 12px 14px;
      min-height: inherit;

      p {
        margin: 0 0 8px;
      }
      h2 {
        font-size: 1.25em;
        font-weight: 600;
        margin: 12px 0 6px;
      }
      h3 {
        font-size: 1.1em;
        font-weight: 600;
        margin: 10px 0 4px;
      }
      ul,
      ol {
        padding-left: 1.5em;
        margin: 0 0 8px;

        &[style*="text-align: center"] {
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
          text-align: left;
        }

        &[style*="text-align: right"] {
          width: fit-content;
          margin-left: auto;
          margin-right: 0;
          text-align: left;
        }
      }
      blockquote {
        border-left: 3px solid #dcdfe6;
        margin: 0 0 8px;
        padding-left: 12px;
        color: #909399;
      }
      hr {
        border: none;
        border-top: 1px solid #dcdfe6;
        margin: 12px 0;
      }
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 8px 0;
      }
      a {
        color: $color-primary;
        text-decoration: underline;
      }

      p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: #c0c4cc;
        pointer-events: none;
        height: 0;
      }
    }
  }
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  color: #606266;
  font-size: 12px;
  font-weight: 600;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover:not(:disabled) {
    background: #e6eef0;
    color: $color-primary;
  }

  &.is-active {
    background: $color-primary;
    color: #fff;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #dcdfe6;
  margin: 0 4px;
}
</style>
