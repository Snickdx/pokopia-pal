import { GuideDishImage } from './GuideDishImage.jsx';

export function FlavorDishList({ items }) {
  return (
    <ul className="flavor-dish-list">
      {items.map((item) => (
        <li key={item} className="flavor-dish">
          <GuideDishImage name={item} size="dish" />
          <span className="flavor-dish__name">{item}</span>
        </li>
      ))}
    </ul>
  );
}
