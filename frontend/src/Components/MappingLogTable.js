import './MappingLogTable.css';

export default function MappingLogTable(params) {
    let log = params.log;
    let page = params.page

    console.log(log);

    return (
        <table id="mapping-log-table">
            <tbody>
                <tr className="ingredient-name">
                    <td colSpan="2">
                        {page + ". " + log.ingredient}
                    </td>
                </tr>
                <tr className="ingredient-prop">
                    <td colSpan="2">
                        Синонимы для предобработанного наименования ингредиента
                    </td>
                </tr>
                {log.synonyms.map((row, i) => {
                    return (
                        <tr>
                            <td className="mapped-column-false">
                                {row.word + " (глубина поиска: " + row.depth + ")"}
                            </td>
                            <td>
                                {row.synonyms.join(", ") + " (количество синонимов: " + row.amount + ")"}
                            </td>
                        </tr>
                    )
                })}
                <tr className="ingredient-prop">
                    <td colSpan="2">
                        Рассмотренные публичные наименования ингредиентов
                    </td>
                </tr>
                {log.primary_values.map((row, j) => {
                    return (
                        <tr className={"mapped-value-" + log.mapped_values.includes(row.primary)}>
                            <td className={"mapped-column-" + log.mapped_values.includes(row.primary)}>
                                {row.primary}
                            </td>
                            <td>
                                {row.preprocessed_primary.join(" + ")}
                            </td>
                        </tr>
                    )
                })}
                <tr className="ingredient-prop">
                    <td colSpan="2">
                        Сопоставленные публичные наименования
                    </td>
                </tr>
                {log.mapped_values.map((row, k) => {
                    return (
                        <tr className="mapped-value-true">
                            <td colSpan="2">{row}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    );
}