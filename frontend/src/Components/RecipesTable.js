import './RecipesTable.css';

function SetRecipeName(i, name) {
    return i + ". " + name;
}

function SetRecipeDescription(description) {
    let text = "";
    if (description !== "") {
        text = text + "Описание: " + description + "\n\r";
    }
    return text;
}

function SetRecipeMethod(method) {
    let text = "";
    if (method !== "") {
        text = text + "Способ приготовления: " + method;
    }
    return text;
}

function SetRecipeTags(list) {
    let tags = "";
    if (list.length !== 0) {
        tags += "Категории: ";
        for(let i = 0; i < list.length; i++)
        {
            tags += list[i];
            if (i !== list.length - 1) tags += ", ";
        }
    }
    return tags;
}

export default function RecipesTable(params) {
    let recipes = params.recipes
    let page = params.page
    let size = params.size
    let count = (page - 1) * size
    if (recipes.length === 0) {
        return (
            <p className='explanation-text'>К сожалению, по Вашему запросы не было найдено соответствующих рецептов</p>
        );
    }

    return (
        <table id="recipes-table">
            <tbody>
                {recipes.map((row, i) => {
                return (
                    <>
                        <tr className="recipe-name"><td colSpan="2">{SetRecipeName(i + 1 + count, row.recipe_name)}</td></tr>
                        { SetRecipeDescription(row.recipe_description) !== "" ?
                            <tr className="recipe-description">
                                <td colSpan="2">
                                    {SetRecipeDescription(row.recipe_description)}
                                </td>
                            </tr> : null }
                        { SetRecipeMethod(row.recipe_method) !== "" ?
                            <tr className="recipe-method">
                                <td colSpan="2">
                                    {SetRecipeMethod(row.recipe_method)}
                                </td>
                            </tr> : null }
                        { SetRecipeTags(row.recipe_tags) !== "" ?
                            <tr className="recipe-tags">
                                <td colSpan="2">
                                    {SetRecipeTags(row.recipe_tags)}
                                </td>
                            </tr> : null }
                        {recipes[i].recipe_ingredients.map((row, j) => {
                            return (
                                <tr className={"recipe-ingredients-" + row.ingredient_used.toString()}>
                                    <td>{row.ingredient_name}</td>
                                    <td>{row.ingredient_amount}</td>
                                </tr>
                                )
                            })
                        }
                    </>
                )
                })}
            </tbody>
        </table>
    );
}