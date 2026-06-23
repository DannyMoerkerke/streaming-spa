import { LitElement, html, css } from 'lit';

export class JsonTable extends LitElement {
  static properties = {
    items: { type: Array }
  };

  static styles = css`
    table {
      border-collapse: collapse;
      width: 100%;
      font-family: sans-serif;
    }

    th,
    td {
      border: 1px solid #ccc;
      padding: 0.5rem;
      text-align: left;
    }

    th {
      background: #f3f3f3;
    }
  `;

  constructor() {
    super();
    this.items = [];
  }

  render() {
    if (!this.items.length) {
      return html`<p>No items</p>`;
    }

    const columns = Object.keys(this.items[0]);

    return html`
      <table>
        <thead>
          <tr>
            ${columns.map(col => html`<th>${col}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${this.items.map(item => html`
            <tr>
              ${columns.map(col => html`<td>${item[col]}</td>`)}
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }
}

customElements.define('json-table', JsonTable);
