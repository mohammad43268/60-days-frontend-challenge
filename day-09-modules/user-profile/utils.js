export const generateBattleCard = ({
  id,
  name,
  anime,
  role,
  strength,
  price,
  imgUrl,
  isHired,
}) => {
  const btnClass = isHired ? "hire-btn hired" : "hire-btn";
  const btnText = isHired ? "Acquired" : "Hire";

  return `
        <article class="battle-card">
            <div class="card-img-wrapper">
                <span class="card-role">${role}</span>
                <img src="${imgUrl}" alt="${name}">
            </div>
            <div class="card-info">
                <h2 class="char-name">${name}</h2>
                <div class="char-anime">${anime}</div>
                <p class="char-strength">${strength}</p>
                <div class="card-footer">
                    <div class="price">¥${price.toLocaleString()}</div>
                    <button class="${btnClass}" data-target-id="${id}" data-price="${price}">
                        ${btnText}
                    </button>
                </div>
            </div>
        </article>
    `;
};
