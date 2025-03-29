import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    primary: {
      50: "#e0fef0",
      100: "#b3fcda",
      200: "#85f9c4",
      300: "#56f6ad",
      400: "#28f297",
      500: "#01E35C", // 主题色
      600: "#00c04e", // dark 变体
      700: "#008c3a",
      800: "#005923",
      900: "#00260e",
    },
    error: "#FF4E59",
  },
  components: {
    Button: {
      baseStyle: {
        _active: {
          opacity: 1,
        },
        _hover: {
          opacity: 1,
          background: "primary.500",
        },
        _disabled: {
          opacity: 1,
        },
      },
      variants: {
        primary: {
          bg: "primary.500",
          color: "white",
          _hover: {
            bg: "primary.600",
          },
          _active: {
            bg: "primary.600",
          },
        },
        disabled: {
          bg: "#C4C4C4",
          color: "white",
          _hover: {
            opacity: 1,
            bg: "#C4C4C4",
          },
          _active: {
            bg: "#C4C4C4",
          },
        },
      },
    },
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
    disableTransitionOnChange: false,
  },
  styles: {
    global: {
      body: {
        bg: "white",
        color: "black",
      },
    },
  },
});

export default theme;
