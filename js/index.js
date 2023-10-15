$(document).ready(function () {
  $(".source-language-btn>.btn").on("click", function () {
    $(".source-language-btn>.btn").addClass("btn-outline-info");
    $(".source-language-btn>.btn").removeClass("btn-info");

    $(this).removeClass("btn-outline-info");
    $(this).addClass("btn-info");
  });

  const source_language_text = $("#source-language-text");

  const loaderDisplay = (status) => {
    if (status) {
      $(".spinner").show();
    } else {
      $(".spinner").hide();
    }
  };

  const ajax = () => {
    const text = source_language_text.val().trim();
    if (!text) return;
    loaderDisplay(true);
    $.ajax({
      url: "https://translate-api.kongwu.top",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        text,
        source_lang: $(".source-language-btn>.btn-info")
          .attr("id")
          .replace("source-", ""),
        target_lang: $(".target-language-btn>.btn-info")
          .attr("id")
          .replace("target-", ""),
      }),
      success: function (response) {
        console.log(response);
        $("#target-language-text").val(response.response.translated_text);
        loaderDisplay(false);
      },
      error: function (xhr, status, error) {
        $("#target-language-text").val("出现错误");
        console.log(error);
        loaderDisplay(false);
      },
    });
  };

  $(".target-language-btn>.btn").on("click", function () {
    $(".target-language-btn>.btn").addClass("btn-outline-info");
    $(".target-language-btn>.btn").removeClass("btn-info");

    $(this).removeClass("btn-outline-info");
    $(this).addClass("btn-info");

    ajax();
  });

  source_language_text.on("input", () => {
    const limit_text = $(".limit-text");
    const textLength = source_language_text.val().trim().length;
    const maxLength = parseInt(source_language_text.attr("maxlength"));
    limit_text.text(`${textLength}/${maxLength}`);
    if (textLength >= maxLength) {
      limit_text.css("color", "red");
    } else {
      limit_text.css("color", "black");
    }
  });

  source_language_text.keydown(function (event) {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      ajax();
    }
  });

  $(".md-translate-btn").click(() => {
    ajax();
  });
});

const autoExpand = (element) => {
  element.style.height = "300px";
  element.style.height = element.scrollHeight + "px";
};
