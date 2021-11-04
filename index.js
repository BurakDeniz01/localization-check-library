const myfunction = () => {
    try {
        var url = "http://localhost:8080/save";

        var data = {
            a: 1,
            b: 2
        };
        console.log("data:", data, url)
    } catch (error) {
        console.log(error)
    }

}
export default { myfunction: myfunction }