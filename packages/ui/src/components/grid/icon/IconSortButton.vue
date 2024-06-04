<template>
  <span v-if="icon === 'basic'">
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="14" height="14" rx="2" fill="#F1F3F5" />
      <path
        d="M7.00008 3.915L8.58508 5.5L9.29008 4.795L7.00008 2.5L4.70508 4.795L5.41508
              5.5L7.00008 3.915ZM7.00008 10.085L5.41508 8.5L4.71008 9.205L7.00008
              11.5L9.29508 9.205L8.58508 8.5L7.00008 10.085Z"
        fill="#121212"
      />
      <path
        d="M7.00008 3.915L8.58508 5.5L9.29008 4.795L7.00008
              2.5L4.70508 4.795L5.41508 5.5L7.00008 3.915ZM7.00008 10.085L5.41508
              8.5L4.71008 9.205L7.00008 11.5L9.29508 9.205L8.58508 8.5L7.00008 10.085Z"
        fill="#D8D8D8"
        fill-opacity="0.09"
      />
    </svg>
  </span>
  <span v-else-if="icon === 'asc'">
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="14" height="14" rx="2" fill="#F1F3F5" />
      <path
        d="M7.00008 3.915L8.58508 5.5L9.29008 4.795L7.00008 2.5L4.70508
              4.795L5.41508 5.5L7.00008 3.915Z"
        fill="#121212"
      />
      <path
        d="M7.00008 3.915L8.58508 5.5L9.29008 4.795L7.00008 2.5L4.70508
              4.795L5.41508 5.5L7.00008 3.915Z"
        fill="#D8D8D8"
        fill-opacity="0.09"
      />
      <path
        d="M7.00008 9.585L8.58508 8L9.29008 8.705L7.00008 11L4.70508
              8.705L5.41508 8L7.00008 9.585Z"
        fill="#DEE2E6"
      />
    </svg>
  </span>
  <span v-else-if="icon === 'desc'">
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="14" height="14" rx="2" fill="#F1F3F5" />
      <path
        d="M7.00008 9.585L8.58508 8L9.29008 8.705L7.00008 11L4.70508
              8.705L5.41508 8L7.00008 9.585Z"
        fill="#121212"
      />
      <path
        d="M7.00008 9.585L8.58508 8L9.29008 8.705L7.00008 11L4.70508
              8.705L5.41508 8L7.00008 9.585Z"
        fill="#D8D8D8"
        fill-opacity="0.09"
      />
      <path
        d="M7.00008 3.915L8.58508 5.5L9.29008 4.795L7.00008 2.5L4.70508
              4.795L5.41508 5.5L7.00008 3.915Z"
        fill="#DEE2E6"
      />
    </svg>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
}>();
</script>
