import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default () => ({
  entry: path.join(__dirname, 'src', 'scripts', 'index.js'),
  optimization: {
    usedExports: true,
  },
  output: {
    filename: '[fullhash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'pages', 'index.html'),
    }),
  ],
});
