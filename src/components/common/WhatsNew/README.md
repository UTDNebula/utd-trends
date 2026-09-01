This component displays what is new from the site's GitHub. On the top right corner, controls a button that will show the latest updates.

### ReleaseData Table

| Prop         | Type     | Description                         | Required |
| :----------- | :------- | :---------------------------------- | -------- |
| id           | `number` | The ID of the GitHub update         | Yes      |
| name         | `string` | A brief title describing the update | Yes      |
| published_at | `string` | The date it update was published on | Yes      |
| body         | `string` | The main description of the update  | Yes      |
| html_url     | `string` | the link to the update on GitHub    | Yes      |

### Feature Table

| Prop       | Type     | Description                                                | Required |
| :--------- | :------- | :--------------------------------------------------------- | -------- |
| id         | `string` | The string ID of the update                                | Yes      |
| version    | `string` | The version of the feature from the GitHub release content | Yes      |
| date       | `string` | The date the release content was published                 | Yes      |
| content    | `string` | A description of the content within the current feature    | Yes      |
| releaseURL | `string` | A string link to the release on GitHub                     | Yes      |
| releaseID  | `string` | The unique ID of this feature                              | Yes      |

### WhatsNew Example

```jsx
import WhatsNew from '@/components/common/WhatsNew/WhatsNew';

<>
  <div className="flex justify-end mr-30 py-3">
    <WhatsNew />
  </div>
</>;
```
