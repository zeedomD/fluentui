import { Provider, ButtonProps } from '@fluentui/react';
import { Customizations, CustomizerContext, ITheme } from 'office-ui-fabric-react';
import * as React from 'react';
import { ComponentVariablesInput, ComponentSlotStylesInput, mergeThemes, ThemeInput } from '@fluentui/styles';

interface ReactBaseThemeProps {
  fluentOverridesTheme?: ThemeInput;
}

// we should decide on naming convention
interface ButtonFluentTokens {}

interface ComponentTheme {
  componentVariables?: ComponentVariablesInput;
  componentStyles?: ComponentSlotStylesInput;
}

export function useTheme(): ITheme {
  const customizerContext = React.useContext(CustomizerContext);
  const settings = Customizations.getSettings(['theme'], 'WithTheme', customizerContext.customizations);
  return settings.theme;
}

const getButtonTheme = (fabricTheme: ITheme, baseTheme: ThemeInput): ComponentTheme => {
  const {
    buttonBorder,
    primaryButtonBackground,
    primaryButtonBackgroundDisabled,
    primaryButtonBackgroundPressed,
    primaryButtonBackgroundHovered,
    primaryButtonText,
    primaryButtonTextDisabled,
    primaryButtonTextHovered,
    primaryButtonTextPressed
  } = fabricTheme.semanticColors;

  /**
   * Issues:
   * 1) Cannot override border.
   * 2) colorActive <-> buttonTextPressed & primaryButtonTextPressed
   */
  return {
    componentVariables: {
      padding: '0 20px',
      minWidth: '80px',
      borderColor: buttonBorder,
      colorActive: primaryButtonTextPressed,
      textPrimaryColor: primaryButtonText,
      textPrimaryColorHover: primaryButtonTextHovered,
      textPrimaryColorDisabled: primaryButtonTextDisabled,
      primaryColorHover: primaryButtonTextHovered,
      primaryBackgroundColor: primaryButtonBackground,
      primaryBackgroundColorActive: primaryButtonBackgroundPressed,
      primaryBackgroundColorHover: primaryButtonBackgroundHovered,
      primaryBackgroundColorDisabled: primaryButtonBackgroundDisabled,
      primaryBoxShadow: 'none',
      boxShadow: 'none'
    },
    // Just a showcase of how we can further customize the styles for the buttons...
    // This should only indicate which variables are missing in the Teams theme, like (primaryBorderWidth)
    componentStyles: {
      root: ({ props: p }: { props: ButtonProps }) => ({
        ...(p.primary && {
          border: 0
        }),
        ':active': {
          animation: 'unset'
        }
      })
    }
  };
};

const getInputTheme = (fabricTheme: ITheme, baseTheme: ThemeInput): ComponentTheme => {
  const {
    inputBackground,
    inputBorder,
    inputFocusBorderAlt
    // inputBorderHovered,
    // disabledBackground,
  } = fabricTheme.semanticColors;

  const { roundedCorner2 } = fabricTheme.effects;

  return {
    componentVariables: {
      backgroundColor: inputBackground,
      borderColor: inputBorder,
      borderWidth: '1px', // where should we get this from
      borderRadius: roundedCorner2,
      inputFocusBorderColor: inputFocusBorderAlt
      // inputDisabledBackgroundL disabledBackground, // this is missing
      // inputHoverBorderColor: inputBorderHovered, // this is missing
      // inputFocusBorderWidth: '2px', // where can I find this
    }
  };
};

// https://github.com/microsoft/fluent-ui-react/blob/master/packages/react/src/themes/teams/components/Button/buttonVariables.ts
function makeFluentTheme(fabricTheme: ITheme, baseTheme: ThemeInput): any {
  const buttonTheme = getButtonTheme(fabricTheme, baseTheme);
  const inputTheme = getInputTheme(fabricTheme, baseTheme);

  const themeOverrides: ThemeInput = {
    componentVariables: {
      Button: buttonTheme.componentVariables,
      Input: inputTheme.componentVariables
    },
    componentStyles: {
      Button: buttonTheme.componentStyles,
      Input: inputTheme.componentStyles
    }
  };

  return mergeThemes(baseTheme, themeOverrides);
}

const FabricToTeamsProvider: React.FunctionComponent<ReactBaseThemeProps> = props => {
  const { fluentOverridesTheme } = props;
  const theme = useTheme();
  const generatedTheme = React.useMemo(() => makeFluentTheme(theme, fluentOverridesTheme), [fluentOverridesTheme, theme]);
  return <Provider theme={generatedTheme}>{props.children}</Provider>;
};

export default FabricToTeamsProvider;
